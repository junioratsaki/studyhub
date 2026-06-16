const { getModel } = require('../../config/gemini');
const { supabaseAdmin } = require('../../config/supabase');

/**
 * Service de gestion de l'Intelligence Artificielle (Gemini 1.5 Pro)
 */

/**
 * Scanne un document PDF ou Image pour vérifier sa cohérence académique
 */
async function scanDocument({ fileBuffer, mimetype, description }) {
  const model = getModel();

  // 1. Préparer le fichier pour Gemini (Base64)
  const base64Data = fileBuffer.toString('base64');
  const part = {
    inlineData: {
      data: base64Data,
      mimeType: mimetype
    }
  };

  const prompt = `
    Tu es un système de modération académique pour StudyHub IUC. Analyse le document fourni 
    et retourne UNIQUEMENT un objet JSON (sans balises markdown) avec ces champs précis :
    {
      "score_coherence": number (0 à 100),
      "is_duplicate": boolean,
      "resume_detecte": "string",
      "commentaires": ["string"]
    }
    
    score_coherence : le document correspond-il à cette description ? : "${description}"
    is_duplicate : ce document semble-t-il déjà exister ou être une copie conforme d'un sujet standard ?
  `;

  try {
    const result = await model.generateContent([prompt, part]);
    const response = await result.response;
    const text = response.text();
    
    // Nettoyer la réponse pour extraire le JSON proprement
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const scanData = JSON.parse(jsonString);

    // 2. Enregistrer le rapport de scan
    const { data: report, error } = await supabaseAdmin
      .from('ai_scan_reports')
      .insert([{
        score_coherence: scanData.score_coherence,
        is_duplicate: scanData.is_duplicate,
        commentaires: scanData, // On stocke tout le JSON pour référence
        passed: scanData.score_coherence >= 70 && !scanData.is_duplicate
      }])
      .select()
      .single();

    if (error) throw error;

    return { 
      passed: report.passed, 
      score: report.score_coherence, 
      report 
    };
  } catch (err) {
    console.error('[AIService] Erreur scanDocument:', err);
    throw { status: 500, message: "Erreur lors de l'analyse IA du document." };
  }
}

/**
 * Crée une nouvelle session de tutorat EduBot pour un sujet spécifique
 */
async function createEduBotSession({ subjectId, userId }) {
  // 1. Récupérer les infos du sujet pour le contexte
  const { data: subject, error: sError } = await supabaseAdmin
    .from('subjects')
    .select('*, filieres(nom), matieres(nom)')
    .eq('id', subjectId)
    .single();

  if (sError || !subject) throw { status: 404, message: 'Sujet non trouvé pour la session.' };

  // 2. Créer la session
  const { data: session, error: iError } = await supabaseAdmin
    .from('ai_sessions')
    .insert([{
      subject_id: subjectId,
      user_id: userId,
      messages: []
    }])
    .select()
    .single();

  if (iError) throw iError;

  return session;
}

/**
 * Gère le streaming de la réponse EduBot (SSE)
 */
async function streamEduBot({ sessionId, userMessage, res }) {
  // 1. Récupérer la session et le contexte
  const { data: session, error: sError } = await supabaseAdmin
    .from('ai_sessions')
    .select('*, subjects(*, filieres(nom), matieres(nom))')
    .eq('id', sessionId)
    .single();

  if (sError || !session) {
    res.write(`data: ${JSON.stringify({ error: 'Session introuvable' })}\n\n`);
    return res.end();
  }

  const { subjects: subject } = session;
  const model = getModel();

  // Configuration des headers SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const systemPrompt = `
    Tu es EduBot, le tuteur pédagogique de l'IUC (Institut Universitaire de la Côte). 
    Ton objectif est d'aider l'étudiant à comprendre son sujet d'examen.
    
    MÉTHODE SOCRATIQUE OBLIGATOIRE :
    - Ne donne JAMAIS la réponse directement.
    - Guide l'étudiant par des questions, des indices et des rappels de cours.
    - Si l'étudiant se trompe, aide-le à trouver son erreur lui-même.
    - Sois encourageant et professionnel.

    CONTEXTE DU SUJET :
    - Matière : ${subject.matieres.nom}
    - Filière : ${subject.filieres.nom}
    - Niveau : ${subject.filieres.niveau || 'N/A'}
    - Année : ${subject.annee}
    - Titre du sujet : ${subject.title}

    HISTORIQUE DE LA CONVERSATION :
    ${JSON.stringify(session.messages)}
  `;

  try {
    const chat = model.startChat({
      history: session.messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessageStream([systemPrompt, userMessage]);
    
    let fullResponse = '';

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      res.write(`data: ${JSON.stringify({ token: chunkText })}\n\n`);
    }

    // Sauvegarder l'historique mis à jour
    const updatedMessages = [
      ...session.messages,
      { role: 'user', content: userMessage, timestamp: new Date() },
      { role: 'assistant', content: fullResponse, timestamp: new Date() }
    ];

    await supabaseAdmin
      .from('ai_sessions')
      .update({ messages: updatedMessages })
      .eq('id', sessionId);

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('[AIService] Erreur streamEduBot:', err);
    res.write(`data: ${JSON.stringify({ error: 'Erreur lors de la génération' })}\n\n`);
    res.end();
  }
}

module.exports = {
  scanDocument,
  createEduBotSession,
  streamEduBot
};
