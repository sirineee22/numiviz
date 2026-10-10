import HomeNavbar from '@/components/HomeNavbar';
import PublicFooter from '@/components/PublicFooter';
import { Sparkles } from 'lucide-react';
import React, { useState, useEffect, ReactNode, useRef, useCallback } from "react";
import { API_BASE } from '@/lib/api';
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, FileText, Video, Image, File, Brain, Download, ExternalLink, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import StudentExerciseAnswer from "./StudentExerciseAnswer";
import DesmosGraph from "@/components/DesmosGraph";
import { ContentBlock } from '../types/ContentBlock';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import parse from 'html-react-parser';

// ─── VideoPlayer — extracted as top-level component to satisfy rules-of-hooks ─

interface VideoPlayerProps {
  src: string;
  lessonId: string | undefined;
  onWatched: () => void;
  onProgress: () => void;
  saveLessonProgress: (id: string) => Promise<boolean>;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  lessonId,
  onWatched,
  saveLessonProgress,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isVideoStarted, setIsVideoStarted] = useState(false);
  const watchTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const isValidUrl = (url: string) => {
    try { new URL(url); return true; } catch { return false; }
  };

  const startWatchTimer = () => {
    if (watchTimerRef.current) clearTimeout(watchTimerRef.current);
    watchTimerRef.current = setTimeout(() => {
      onWatched();
    }, 30000);
  };

  useEffect(() => {
    return () => {
      if (watchTimerRef.current) clearTimeout(watchTimerRef.current);
    };
  }, []);

  const handlePlay = () => { setIsVideoStarted(true); startWatchTimer(); };
  const handlePause = () => { if (watchTimerRef.current) clearTimeout(watchTimerRef.current); };

  const handleEnded = async () => {
    onWatched();
    if (watchTimerRef.current) clearTimeout(watchTimerRef.current);
    if (lessonId) await saveLessonProgress(lessonId);
  };

  const handleError = () => {
    setHasError(true);
    if (watchTimerRef.current) clearTimeout(watchTimerRef.current);
  };

  if (!isValidUrl(src) && !src.startsWith('/')) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        URL de la vidéo invalide.
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      {hasError ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Impossible de charger la vidéo.
        </div>
      ) : (
        <div className="relative">
          <video
            key={`video-${src}`}
            ref={videoRef}
            src={src}
            controls
            className="w-full h-auto max-h-[70vh] bg-black"
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            onError={handleError}
            playsInline
            preload="auto"
            crossOrigin="anonymous"
          >
            Votre navigateur ne prend pas en charge la lecture de vidéos.
          </video>
          {!isVideoStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <button
                onClick={() => videoRef.current?.play().catch(() => setHasError(true))}
                className="p-4 bg-black/70 rounded-full text-white hover:bg-black/90 transition-colors"
              >
                ▶️ Lire la vidéo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface Lesson {
  id: number;
  titre: string;
  description: string;
  duree: string;
  niveau: string;
  visibilite: string;
  prerequis: string;
  progression: boolean;
  contenu: string;
}

const LessonView = () => {
  const { lessonId, moduleId } = useParams<{ lessonId: string; moduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Fonction pour sauvegarder la progression de la leçon
  const saveLessonProgress = async (lessonId: string) => {
    if (!user) return false;
    
    try {
      console.log('Sauvegarde de la progression pour la leçon:', lessonId);
      const response = await fetch(`${API_BASE}/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.id, // Changed from userId to user_id
          module_id: moduleId // Changed from moduleId to module_id
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erreur lors de la sauvegarde de la progression:', errorData);
        return false;
      }
      
      const result = await response.json();
      console.log('Progression sauvegardée avec succès:', result);
      
      // Mettre à jour le state local immédiatement
      setIsVideoWatched(true);
      setVideoProgress(100);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la progression:', error);
      return false;
    }
  };
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState<{ [blockId: string]: boolean }>({});
  const [lessons, setLessons] = useState<{id: string, titre: string}[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(-1);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isVideoWatched, setIsVideoWatched] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    if (lesson?.contenu) {
      try {
        const blocks = typeof lesson.contenu === 'string' ? JSON.parse(lesson.contenu) : lesson.contenu;
        const videoExists = Array.isArray(blocks) && blocks.some((block: any) => 
          block.type === 'video' || block.type === 'video_manim'
        );
        setHasVideo(videoExists);
      } catch (e) {
        console.warn('Could not parse lesson.contenu for video check:', e);
        setHasVideo(false);
      }
    } else {
      setHasVideo(false);
    }
  }, [lesson]);

  // Récupérer la liste des leçons du module
  useEffect(() => {
    const fetchLessons = async () => {
      console.log('Début du chargement des leçons pour le module:', moduleId);
      if (!moduleId) {
        console.log('Aucun moduleId fourni');
        return;
      }
      
      try {
        // Récupérer les leçons du module depuis l'API
        const response = await fetch(`${API_BASE}/lessons/module/${moduleId}`);
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Leçons reçues:', data);
        
        // Trier les leçons par leur ordre
        const sortedLessons = data.sort((a: { ordre: number }, b: { ordre: number }) => a.ordre - b.ordre);
        setLessons(sortedLessons);
        
        // Trouver l'index de la leçon actuelle
        const currentIndex = sortedLessons.findIndex((l: { id: string | number }) => l.id.toString() === lessonId);
        console.log('Index de la leçon actuelle:', currentIndex);
        
        if (currentIndex === -1) {
          console.warn('Leçon actuelle non trouvée dans la liste des leçons');
          return;
        }
        
        setCurrentLessonIndex(currentIndex);
      } catch (err) {
        console.error('Erreur lors du chargement des leçons:', err);
        // En cas d'erreur, on utilise des données factices pour le débogage
        console.log('Utilisation de données factices pour le débogage');
        const mockLessons = [
          { id: '29', titre: 'Leçon actuelle', ordre: 1 },
          { id: '30', titre: 'Prochaine leçon', ordre: 2 },
          { id: '31', titre: 'Dernière leçon', ordre: 3 }
        ];
        setLessons(mockLessons);
        const currentIndex = mockLessons.findIndex(l => l.id === lessonId);
        setCurrentLessonIndex(currentIndex >= 0 ? currentIndex : 0);
      }
    };
    
    fetchLessons();
  }, [moduleId, lessonId]);

  // Navigation vers la leçon suivante
  const navigateToNextLesson = async () => {
    // Condition to save progress: if there's a video and it's not watched, OR if there's no video.
    if ((hasVideo && !isVideoWatched) || (!hasVideo && lessonId)) {
      const success = await saveLessonProgress(lessonId);
      if (!success) {
        console.error('Impossible de sauvegarder la progression avant de continuer');
        return;
      }
    }

    if (!lessons.length || currentLessonIndex === -1) {
      console.log('Aucune leçon disponible ou index invalide');
      return;
    }
    
    const nextIndex = currentLessonIndex + 1;
    if (nextIndex >= lessons.length) {
      console.log('Dernière leçon atteinte');
      // Save progress for the very last lesson before navigating back to module view
      if (lessonId) {
        await saveLessonProgress(lessonId);
      }
      // Utiliser navigate pour revenir à la liste des modules
      navigate(`/modules/${moduleId}`, { state: { openLessonId: lessonId, lessonCompleted: true } }); // Add lessonCompleted: true
      return;
    }
    
    const nextLesson = lessons[nextIndex];
    console.log('Navigation vers la leçon suivante:', nextLesson);
    
    // Sauvegarder la progression avant de naviguer
    if (lessonId) {
      await saveLessonProgress(lessonId);
    }
    
    // Utiliser navigate pour la navigation SPA sans rechargement complet
    navigate(`/lesson-view/${nextLesson.id}/${moduleId}`, { 
      replace: true,
      state: { fromNavigation: true }
    });
    
    // Forcer un léger délai pour s'assurer que la navigation est terminée
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  };

  // VideoPlayer is defined outside LessonView (see below) and called with callbacks
  const renderVideoPlayer = (src: string) => (
    <VideoPlayer
      src={src}
      lessonId={lessonId}
      onWatched={() => { setIsVideoWatched(true); setVideoProgress(100); }}
      onProgress={() => setVideoProgress(100)}
      saveLessonProgress={saveLessonProgress}
    />
  );

  useEffect(() => {
    if (!lessonId || lessonId === 'new') {
      setError('Leçon introuvable');
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`${API_BASE}/lessons/${lessonId}`)
      .then(res => {
        if (!res.ok) throw new Error('Leçon introuvable');
        return res.json();
      })
      .then(data => {
        setLesson(data);
        try {
          if (data.contenu) {
            console.log('Raw lesson content (data.contenu):', data.contenu); // Keep for debugging if needed
            const blocks = JSON.parse(data.contenu);
            console.log('Parsed content blocks:', blocks); // Keep for debugging if needed
            if (Array.isArray(blocks)) {
              setContentBlocks(blocks);
            } else {
              console.warn('Content is not an array:', blocks);
              setContentBlocks([]);
            }
          } else {
            console.log('No content in lesson data.');
            setContentBlocks([]);
          }
        } catch (err) {
          console.error('Erreur lors du parsing des blocs de contenu:', err);
          setContentBlocks([]);
        }
      })
      .catch(err => {
        console.error('Erreur lors du chargement de la leçon:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  const cleanLatex = (s: string): string => {
    if (!s) return '';
    let res = s.replace(/\\{2,}([a-zA-Z]+)/g, '\\$1');
    res = res.replace(/\\{3,}/g, '\\\\');
    return res.trim();
  };

  const renderWithLatex = (content: string) => {
    if (!content) return null;
    const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
    const parts = content.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const raw = part.slice(2, -2);
        const math = cleanLatex(raw);
        return (
          <BlockMath
            key={index}
            math={math}
            renderError={() => (
              <pre className="p-2 text-xs text-amber-700 bg-amber-50 rounded font-mono overflow-x-auto my-2">
                {raw}
              </pre>
            )}
          />
        );
      } else if (part.startsWith('$') && part.endsWith('$')) {
        const raw = part.slice(1, -1);
        const math = cleanLatex(raw);
        return (
          <InlineMath
            key={index}
            math={math}
            renderError={() => (
              <code className="text-xs text-amber-700 bg-amber-50 px-1 rounded font-mono">
                {raw}
              </code>
            )}
          />
        );
      } else {
        return <React.Fragment key={index}>{parse(part)}</React.Fragment>;
      }
    });
  };


  // Removed isMathFormula function
  // function isMathFormula(text: string): boolean {
  //   const mathPattern = /([=+\-*/^]|\\frac|\\sqrt|\\int|\\sum|\\det|\\lim|\\sin|\\cos|\\tan|\d+\s*[a-zA-Z])/;
  //   return mathPattern.test(text.trim()) && text.trim().length < 100; 
  // }

  // Gère la navigation vers la page suivante
  const handleNextLesson = useCallback(() => {
    // Logique pour passer à la leçon suivante
    // À implémenter : récupérer l'ID de la prochaine leçon
    // navigate(`/lesson/${nextLessonId}/${moduleId}`);
  }, []);

  // Fonction utilitaire pour formater les URLs des médias
  const formatMediaUrl = (url: string): string => {
    if (!url) return '';
    // Si l'URL est déjà relative, on la retourne telle quelle
    if (url.startsWith('/')) return url;
    // If it's a full URL to localhost:8000, convert it to a relative path
    const localhostMatch = url.match(/^https?:\/\/localhost:8000(\/.*)$/);
    if (localhostMatch) {
      return localhostMatch[1];
    }
    return url;
  };

  const renderContentBlock = (block: ContentBlock) => {
    const content = { ...(block.content || {}) };
    
    // Formater les URLs des médias
    if (content.url) {
      content.url = formatMediaUrl(content.url);
    }

    const BlockWrapper = ({ children, icon, title }: { children: ReactNode, icon: ReactNode, title: string }) => (
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gray-100 p-2 rounded-lg">{icon}</div>
          <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
        </div>
        <div className="ml-12 pl-4 border-l-2 border-gray-200">{children}</div>
      </div>
    );

    switch (block.type) {
      case 'video':
      case 'video_manim':
        return (
          <div key={block.id} className="mb-16">
            <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl mb-4">
              {renderVideoPlayer(content.url)}
            </div>
            <h2 className="text-3xl font-bold text-gray-900">{content.title || 'Vidéo'}</h2>
            {content.description && <p className="text-lg text-gray-600 mt-2 max-w-4xl">{content.description}</p>}
          </div>
        );

      case 'text':
        return (
          <div key={block.id} className="prose prose-lg max-w-none mb-12 text-gray-800 leading-relaxed">
            {content.content ? (
              typeof content.content === 'string' ? (
                <div className="whitespace-pre-wrap">
                  {renderWithLatex(content.content)}
                </div>
              ) : (
                <div>Contenu de type non pris en charge</div>
              )
            ) : (
              <div className="text-gray-400 italic">Aucun contenu</div>
            )}
          </div>
        );

      case 'image':
        return (
          <div key={block.id} className="mb-12 text-center">
            <img src={content.url} alt={content.alt || 'Image de la leçon'} className="max-w-full h-auto rounded-lg shadow-lg mx-auto" />
            {content.caption && <p className="text-base text-gray-500 mt-3 italic">{content.caption}</p>}
          </div>
        );

      case 'file':
        return (
          <BlockWrapper icon={<Download size={20} className="text-gray-600" />} title="Fichier à télécharger">
            <a href={content.url} download target="_blank" rel="noopener noreferrer">
              <Button>
                <Download className="mr-2" size={16} />
                {content.title || 'Télécharger'}
              </Button>
            </a>
          </BlockWrapper>
        );

      case 'quiz':
        return (
            <BlockWrapper icon={<Brain size={20} className="text-gray-600" />} title="Quiz Interactif">
                <div className="space-y-4">
                    {content.questions?.map((question: { id?: string; question: string }, qIndex: number) => (
                        <div key={question.id || qIndex} className="border rounded-lg p-4">
                            <div className="font-medium mb-3">
                                Question {qIndex + 1}: {question.question}
                            </div>
                        </div>
                    ))}
                </div>
            </BlockWrapper>
        );

      case 'exercice':
        return (
          <BlockWrapper icon={<Brain size={20} className="text-gray-600" />} title="Exercice d'application">
            <StudentExerciseAnswer
              question={content.question}
              solution={user?.role === 'professeur' && showSolution[block.id] ? content.solution : undefined}
            />
            {user?.role === 'professeur' && (
              <div className="text-right mt-2">
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSolution(prev => ({ ...prev, [block.id]: !prev[block.id] }));
                    }}
                  >
                    {showSolution[block.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span className="ml-2">{showSolution[block.id] ? 'Cacher' : 'Voir'} la solution</span>
                  </Button>
              </div>
            )}
          </BlockWrapper>
        );

      case 'desmos':
        return (
          <BlockWrapper icon={<ExternalLink size={20} className="text-gray-600" />} title="Grapheur Desmos">
            <div className="h-[500px] border rounded-lg overflow-hidden">
              <DesmosGraph expression={content.expression} />
            </div>
          </BlockWrapper>
        );

      case 'key_takeaways':
        return (
          <div key={block.id} className="mb-12">
            <div className="rounded-xl border-l-4 border-primary bg-primary/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-primary">
                  {content.title || 'Key Takeaways'}
                </h3>
              </div>
              <ul className="space-y-2">
                {(content.items || []).map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-800">
                    <span className="mt-1 h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      default:
        return (
          <div key={block.id} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-gray-500 italic">Type de bloc non reconnu: {block.type}</div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full relative overflow-x-hidden flex flex-col justify-between" style={{ backgroundColor: '#FAF9F6' }}>
        <HomeNavbar scrolled={scrolled} />
        <div className="flex-1 flex items-center justify-center pt-28 pb-16">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200/90 p-8 shadow-sm text-center max-w-sm w-full mx-4 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/70 border border-amber-200 flex items-center justify-center mx-auto text-amber-700 animate-pulse">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto animate-pulse" />
              <div className="h-3 bg-slate-100 rounded w-1/2 mx-auto animate-pulse" />
            </div>
            <p className="text-xs text-slate-500 font-medium">Chargement de la leçon...</p>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
          <p className="text-gray-600 mb-6">{error || 'Leçon introuvable'}</p>
          <Button onClick={() => navigate(`/module/${moduleId}`)}>
            <ArrowLeft className="mr-2" size={16} />
            Retour au module
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-sans text-slate-900 w-full relative overflow-x-hidden flex flex-col justify-between"
      style={{ backgroundColor: '#FAF9F6' }}
    >
      {/* Delicate dot grid */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.15) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Ambient glowing gradient orbs */}
      <div className="absolute -top-12 -left-12 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-orange-300/35 via-amber-200/20 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="absolute -top-10 right-0 w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-amber-400/35 via-orange-300/25 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="absolute top-[480px] -right-16 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-indigo-400/35 via-purple-300/20 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Decorative Technical Grid Frames on Outer Margins */}
      <div className="hidden xl:block absolute left-4 top-36 w-24 h-48 rounded-2xl border-2 border-amber-300/50 bg-amber-50/15 overflow-hidden pointer-events-none z-0">
        <svg viewBox="0 0 96 192" className="w-full h-full opacity-40">
          <defs>
            <pattern id="lessonGridLeft" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#F59E0B" strokeWidth="0.65" />
            </pattern>
          </defs>
          <rect width="96" height="192" fill="url(#lessonGridLeft)" />
        </svg>
      </div>

      <div className="hidden xl:block absolute right-4 top-36 w-24 h-48 rounded-2xl border-2 border-amber-300/50 bg-amber-50/15 overflow-hidden pointer-events-none z-0">
        <svg viewBox="0 0 96 192" className="w-full h-full opacity-40">
          <defs>
            <pattern id="lessonGridRight" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#F59E0B" strokeWidth="0.65" />
            </pattern>
          </defs>
          <rect width="96" height="192" fill="url(#lessonGridRight)" />
        </svg>
      </div>

      {/* Hand-Drawn Margin Notebook Doodles */}
      <div className="hidden lg:block absolute left-4 xl:left-8 top-[360px] pointer-events-none select-none z-0 text-slate-400 space-y-24">
        <svg viewBox="0 0 50 70" className="w-9 h-14 text-slate-500">
          <path d="M38 4 C 18 15, 12 40, 16 60" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M10 52 L 16 62 L 24 54" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg viewBox="0 0 30 90" className="w-6 h-20 text-slate-500">
          <path d="M15 4 C 4 10, 4 20, 20 25 C 4 30, 4 40, 20 45 C 4 50, 4 60, 20 65 C 4 70, 4 80, 20 85" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      <div className="hidden lg:block absolute right-4 xl:right-8 top-[360px] pointer-events-none select-none z-0 text-slate-400 space-y-24">
        <svg viewBox="0 0 50 60" className="w-9 h-12 text-slate-500">
          <path d="M10 8 C 30 12, 40 28, 32 50" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M24 44 L 32 52 L 38 42" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg viewBox="0 0 60 60" className="w-12 h-12 text-slate-500">
          <circle cx="30" cy="30" r="24" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="14" y1="18" x2="44" y2="40" stroke="currentColor" strokeWidth="1.2" />
          <line x1="18" y1="12" x2="48" y2="34" stroke="currentColor" strokeWidth="1.2" />
          <line x1="12" y1="26" x2="40" y2="46" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </div>

      <HomeNavbar scrolled={scrolled} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28 flex-1 w-full">
        
        <div className="mb-10 space-y-3">
          <button
            onClick={() => navigate(`/module/${moduleId}`)}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-stone-200/80 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white shadow-2xs transition-all mb-2"
          >
            <ArrowLeft size={14} />
            Retour au module
          </button>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
            <span className="relative inline-block text-slate-900">
              {lesson.titre}
              <svg
                className="absolute -bottom-2 inset-x-0 w-full h-3 text-amber-400 pointer-events-none overflow-visible"
                viewBox="0 0 160 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M 2 7 C 45 2, 115 2, 158 7"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
          {lesson.description && (
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl pt-1">
              {lesson.description}
            </p>
          )}
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-6 sm:p-10 mb-8">

          {contentBlocks.length === 0 ? (
            <div key="empty-lesson" className="text-center py-16">
              <FileText className="w-16 h-16 mx-auto mb-6 text-gray-300" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Cette leçon est vide</h3>
              <p className="text-lg text-gray-600">Il n'y a pas encore de contenu à afficher.</p>
              {user?.role === 'professeur' && (
                <Button 
                  className="mt-6" 
                  size="lg"
                  onClick={() => navigate(`/lesson/${lesson.id}/${moduleId}`)}
                >
                  <Edit className="mr-2" size={18} />
                  Commencer à éditer
                </Button>
              )}
            </div>
          ) : (
            contentBlocks.map((block, index) => (
              <React.Fragment key={`block-${block.id || index}`}>
                {renderContentBlock(block)}
              </React.Fragment>
            ))
          )}
        </div>

      </div>
           {/* Bouton Leçon suivante avec progression améliorée */}
      {/* Floating Bottom Action Capsule */}
      <div className="sticky bottom-4 z-40 max-w-4xl mx-auto px-4 w-full">
        <div className="bg-[#FAF9F6]/95 backdrop-blur-md border border-stone-300/80 rounded-2xl shadow-lg p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {videoProgress > 0 && videoProgress < 90 && (
              <div className="w-32 bg-stone-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>
            )}
            <span className="text-xs text-slate-500 font-medium">
              {hasVideo && !isVideoWatched ? (
                videoProgress > 0 ? "Progression de la vidéo en cours..." : "Regardez la vidéo pour débloquer la suite"
              ) : (
                "Prêt pour l'étape suivante !"
              )}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {currentLessonIndex < lessons.length - 1 ? (
              <button
                onClick={navigateToNextLesson}
                disabled={hasVideo && !isVideoWatched}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all duration-200 active:scale-[0.98] ${
                  (hasVideo && isVideoWatched) || !hasVideo
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <span>Leçon suivante</span>
                <span className="font-bold">→</span>
              </button>
            ) : (
              <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                🎉 Félicitations ! Module terminé.
              </div>
            )}
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};

export default LessonView;
