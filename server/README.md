# Intégration de Gemini Flash API dans StudyHub (EduBot)

Ce guide explique comment intégrer l'IA Gemini Flash de Google pour réaliser **EduBot**, l'assistant pédagogique intelligent de StudyHub IUC.

## 🎯 Le Rôle d'EduBot (Spécifications du Projet)

Selon le rapport de conception, EduBot n'est pas un simple chatbot, mais un tuteur interactif basé sur la **méthode socratique**. Son rôle est divisé en trois axes :

### 1. Correcteur de propositions (Usage Interne Enseignant)
L'IA analyse les corrections soumises par les enseignants avant publication.
- **Fonctionnalités :** Annotations d'erreurs (rouge) et d'éléments corrects (vert), calcul d'un score de confiance et suggestions d'amélioration.
- **Objectif :** Garantir la fiabilité académique des contenus.

### 2. Générateur de solutions assistées (Pour l'Étudiant)
Lorsqu'un sujet n'a pas encore de correction officielle, l'étudiant peut demander une aide à l'IA.
- **Fonctionnalités :** Génération d'une correction étape par étape, marquée explicitement comme "Générée par IA".
- **Interface :** S'affiche dans le volet droit du mode **Split-View**.

### 3. Coach de révision contextuel (Tuteur Interactif)
L'étudiant peut sélectionner une zone spécifique du sujet pour obtenir une explication.
- **Fonctionnalités :** Utilisation d'un **Area-Prompt**. L'IA guide l'élève par des indices (méthode socratique) plutôt que de donner la réponse directement.
- **Rendu :** Les formules scientifiques doivent être rendues via **LaTeX**.

---

## 🛠 Implémentation Technique

### 1. Configuration
Ajoutez votre clé API dans le fichier `.env` :
```env
GEMINI_API_KEY=votre_cle_api_ici
```

### 2. Service IA (`src/modules/ai/ai.service.js`)
Voici une structure adaptée pour gérer les différents rôles d'EduBot :

```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Génère une réponse selon le rôle (Coach, Générateur ou Correcteur)
 */
async function askEduBot({ prompt, role, context }) {
  let systemInstruction = "";

  switch (role) {
    case 'COACH':
      systemInstruction = "Tu es un tuteur socratique. Ne donne jamais la réponse directement. Guide l'étudiant avec des indices et des questions pour l'amener à la solution.";
      break;
    case 'GENERATOR':
      systemInstruction = "Génère une correction détaillée étape par étape pour l'exercice suivant. Sois précis et pédagogique.";
      break;
    case 'CORRECTOR':
      systemInstruction = "Analyse cette proposition de correction. Identifie les erreurs et suggère des améliorations. Retourne un score de confiance sur 100.";
      break;
    default:
      systemInstruction = "Tu es EduBot, l'assistant pédagogique de StudyHub IUC.";
  }

  try {
    const result = await model.generateContent([systemInstruction, prompt]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Erreur EduBot:", error);
    throw new Error("L'assistant EduBot est temporairement indisponible.");
  }
}

module.exports = { askEduBot };
```

### 3. Points d'intégration clés
- **Scan IA de cohérence :** Utiliser Gemini pour comparer le fichier PDF uploadé et la description fournie par l'étudiant (score $\ge 70\%$ requis pour publication).
- **Streaming SSE :** Pour l'effet "écriture en direct" dans le panneau EduBot, utilisez les `Server-Sent Events (SSE)` comme prévu dans l'architecture.
- **Rendu LaTeX :** Côté frontend, utilisez une bibliothèque comme `react-markdown` avec `remark-math` et `rehype-katex` pour afficher les formules scientifiques.

## ⚠️ Rappels Importants
- **Sécurité :** La clé API doit rester côté serveur.
- **Coûts :** Surveillez vos quotas sur Google AI Studio.
- **Prompt Engineering :** Affinez les instructions système pour chaque rôle afin de respecter strictement la méthode socratique.
