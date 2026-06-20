import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Maximize2, Minimize2, Download, MessageSquare } from 'lucide-react';
import EduBotChat from '../../components/dashboard/EduBotChat';
import api from '../../lib/axios';

const SubjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check mobile screen
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
      if (window.innerWidth < 1024) {
        setIsChatOpen(false); // Close chat by default on mobile to show PDF first
      } else {
        setIsChatOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const fetchSubjectDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/subjects/${id}`);
        if (response.data.success) {
          const resSubject = response.data.data.subject;
          setSubject({
            id: resSubject.id,
            title: resSubject.title,
            type: resSubject.type_examen === 'NORMAL' ? 'SN' : (resSubject.type_examen === 'RATTRAPAGE' ? 'RAT' : resSubject.type_examen),
            matiere: resSubject.matieres?.nom || 'Général',
            annee: resSubject.annee,
            file_url: resSubject.file_url,
            corrections: response.data.data.corrections
          });
        }
      } catch (error) {
        console.error("Erreur de chargement du sujet:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectDetails();

    return () => window.removeEventListener('resize', checkMobile);
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-iuc-red"></div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Sujet introuvable</h2>
        <button onClick={() => navigate('/library')} className="text-iuc-red hover:underline">Retour à la bibliothèque</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen lg:h-full bg-iuc-dark overflow-hidden">
      
      {/* Header / Toolbar */}
      <div className="h-16 border-b border-white/10 bg-iuc-gray flex items-center justify-between px-4 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/library')}
            className="w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="hidden sm:block">
            <h1 className="font-bold text-white text-sm md:text-base truncate max-w-[300px] xl:max-w-[500px]">{subject.title}</h1>
            <p className="text-xs text-gray-400">{subject.matiere} • {subject.type} {subject.annee}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a 
            href={subject.file_url} 
            target="_blank" 
            rel="noreferrer"
            className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
            title="Télécharger"
          >
            <Download size={18} />
          </a>
          
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isChatOpen 
                ? 'bg-iuc-green/20 text-iuc-green' 
                : 'bg-iuc-red text-white hover:bg-red-600 shadow-lg shadow-iuc-red/20'
            }`}
          >
            <MessageSquare size={18} />
            <span className="hidden sm:inline">{isChatOpen ? 'Fermer EduBot' : 'Demander à l\'IA'}</span>
          </button>
        </div>
      </div>

      {/* Split View Content */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left/Main: PDF Viewer */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isChatOpen && !isMobile ? 'lg:w-[60%]' : 'w-full'} h-full bg-[#323639]`}>
          <iframe 
            src={`${subject.file_url}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-full border-none"
            title={subject.title}
          />
        </div>

        {/* Right/Overlay: EduBot Chat */}
        <div className={`
          transition-all duration-300 h-full bg-iuc-dark z-20
          ${isMobile 
            ? `absolute inset-y-0 right-0 w-full transform ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}` 
            : `lg:w-[40%] border-l border-white/10 ${isChatOpen ? 'block' : 'hidden'}`
          }
        `}>
          <EduBotChat subjectId={subject.id} />
        </div>

      </div>
    </div>
  );
};

export default SubjectDetailPage;
