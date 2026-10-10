import { useState, useEffect } from "react";
import { API_BASE } from '@/lib/api';
import { useParams } from "react-router-dom";
import {
  ArrowLeft, BookOpen, Play, BarChart3, Brain, Plus, Edit, Save, X, CheckCircle,
  CheckCircle2, Clock, FileText, Users, Trash2, Lock, ChevronRight, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Pencil, Save as SaveIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import HomeNavbar from '@/components/HomeNavbar';
import QuizSection from "./QuizSection";

// --- Types ---
interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: string;
  objectives: string[];
  videoUrl?: string;
  completed: boolean;
  description: string;
  niveau?: string;
  ordre?: number; // Add this line
}

interface Exercise {
  id: string;
  title: string;
  difficulty: string;
  estimatedTime: string;
  completed: boolean;
}

interface Resource {
  id: string;
  title: string;
  type: 'PDF' | 'Notes' | 'Lien';
  url: string;
  size?: string;
}

interface Module {
  id?: string;
  titre: string;
  description: string;
  type?: string;
  contenu?: string;
  id_enseignant?: string | null;
  categorie?: string | null;
  niveau?: string | null;
  duree?: string | null;
  objectifs?: string[];
}


const ProgressBar = ({ value }: { value: number }) => (
  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
    <div className="h-full bg-blue-600" style={{ width: `${value}%` }} />
  </div>
);

const Badge = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>{children}</span>
);

const Module = () => {
  const { moduleId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Get location object
  const [moduleData, setModuleData] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [moduleProgress, setModuleProgress] = useState<{ overall_progress: number; video_progress: number; quiz_score: number } | null>(null);

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
      const [activeTab, setActiveTab] = useState<'lecons' | 'quiz'>('lecons');
  const [showCreateLesson, setShowCreateLesson] = useState(false);
  const [showEditModule, setShowEditModule] = useState(false);
  const [newLesson, setNewLesson] = useState({ title: '', content: '', duration: '', objectives: [''] });
  const [editModuleData, setEditModuleData] = useState({ title: '', description: '' });
 

  // Nouveaux états pour les données dynamiques
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]); // À adapter si tu as un endpoint pour les ressources
  const [editingDetail, setEditingDetail] = useState(false);
  const [editDetailData, setEditDetailData] = useState<{ titre: string; description: string }>({ titre: '', description: '' });
  const [selectedLessonEdit, setSelectedLessonEdit] = useState<Lesson | null>(null);
  const [editLessonData, setEditLessonData] = useState<{ title: string; content: string; videoUrl: string }>({ title: "", content: "", videoUrl: "" });
  const [videoOptions, setVideoOptions] = useState([
    { value: "video1.mp4", label: "Vidéo Manim 1" },
    { value: "video2.mp4", label: "Vidéo Manim 2" },
    { value: "video3.mp4", label: "Vidéo Manim 3" },
  ]);

  // Handler for creating a lesson
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLesson.title || !newLesson.content || !newLesson.duration || !moduleId) return;
    try {
      const res = await fetch(`${API_BASE}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre: newLesson.title,
          contenu: newLesson.content,
          duree: newLesson.duration,
          id_module: Number(moduleId),
          id_enseignant: user?.id,
        })
      });
      if (!res.ok) throw new Error('Erreur lors de la création de la leçon');
      const lessonCree = await res.json();
      // Mettre à jour la liste des leçons
      setAllLessons(prev => [...prev, mapLesson(lessonCree)]);
      setNewLesson({ title: '', content: '', duration: '', objectives: [''] });
      setShowCreateLesson(false);
    } catch (err) {
      alert('Erreur lors de la création de la leçon');
    }
  };

  const handleEditModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModuleData.title || !editModuleData.description || !moduleId) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/modules/${moduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre: editModuleData.title,
          description: editModuleData.description,
          type: moduleData?.type || '',
          contenu: moduleData?.contenu || '',
          id_enseignant: user?.id || null,
          categorie: moduleData?.categorie || null,
          niveau: moduleData?.niveau || null,
          duree: moduleData?.duree || null,
          objectifs: moduleData?.objectifs || []
        }),
        credentials: 'include'  // Important pour les sessions/cookies
      });
      if (!res.ok) throw new Error('Erreur lors de la modification du module');
      const updated = await res.json();
      setModuleData(prev => ({
        ...prev,
        titre: updated.titre || prev?.titre || '',
        description: updated.description || prev?.description || ''
      }));
      setShowEditModule(false);
    } catch (err) {
      alert('Erreur lors de la modification du module');
    }
  };

  // Chargement dynamique des données
  useEffect(() => {
    console.log("Current user in Module.tsx useEffect:", user);
    if (!moduleId) return;
    setLoading(true);
    setFetchError(null);
    // 1. Charger le module
    fetch(`${API_BASE}/modules/${moduleId}`, {
      credentials: 'include'  // Important pour les sessions/cookies
    })
      .then(res => {
        if (!res.ok) throw new Error("Module introuvable");
        return res.json();
      })
      .then(data => {
        console.log("Module data:", data);
        setModuleData({
          id: data.id_module || data.id,
          titre: data.titre || "Titre inconnu",
          description: data.description || "Aucune description disponible",
          type: data.type || '',
          contenu: data.contenu || '',
          id_enseignant: data.id_enseignant,
          categorie: data.categorie,
          niveau: data.niveau,
          duree: data.duree,
          objectifs: data.objectifs || []
        });
        // Mettre à jour les données d'édition
        setEditModuleData({
          title: data.titre || "",
          description: data.description || ""
        });
      })
      .catch((err) => {
        console.error("Error fetching module:", err);
        setModuleData({ titre: "Module introuvable", description: "Ce module n'existe pas ou une erreur est survenue." });
        setFetchError(err.message);
      });
    // 2. Charger les leçons du module
    console.log("Fetching lessons with user ID:", user?.id);
    fetch(`${API_BASE}/lessons/module/${moduleId}${user ? `?user_id=${user.id}` : ''}`)
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors du chargement des lecons');
        return res.json();
      })
      .then(lessons => {
        const safeLessons = Array.isArray(lessons) ? lessons.map(mapLesson) : [];
        setAllLessons(safeLessons);
        fetch(`${API_BASE}/exercises`)
          .then(res => res.json())
          .then(exs => setAllExercises(Array.isArray(exs) ? exs : []))
          .catch(() => setAllExercises([]))
          .finally(() => setLoading(false));
      })
      .catch((err) => {
        console.error("Error fetching lessons:", err);
        setAllLessons([]);
        setLoading(false);
      });
  }, [moduleId, user, location.state]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch module progress when user and module are available
  useEffect(() => {
    if (user && moduleId) {
      fetch(`${API_BASE}/progress/module/${user.id}/${moduleId}`)
        .then(res => {
          console.log("Progress API response status:", res.status);
          return res.json();
        })
        .then(data => {
          console.log("Module progress data:", data);
          setModuleProgress(data);
        })
        .catch(err => console.error('Error fetching module progress:', err));
    }
  }, [user, moduleId]);

  // Synchronise editModuleData quand moduleData change
  useEffect(() => {
    if (moduleData) {
      setEditModuleData({
        title: moduleData.titre || '',
        description: moduleData.description || ''
      });
    }
  }, [moduleData]);

  // Synchronise editDetailData quand selectedLesson change
  useEffect(() => {
    if (selectedLesson) {
      setEditDetailData({ titre: selectedLesson.title, description: selectedLesson.description });
      setEditingDetail(false);
    }
  }, [selectedLesson]);

    const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- All Dossiers View ---
  if (!moduleData && !fetchError) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col">
      <HomeNavbar scrolled={scrolled} />
      <div className="flex-1 flex items-center justify-center pt-24">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="h-4 bg-muted rounded w-48"></div>
          <div className="h-3 bg-muted rounded w-32"></div>
        </div>
      </div>
      </div>
    );
  }
  
  if (fetchError) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col">
      <HomeNavbar scrolled={scrolled} />
      <div className="flex-1 flex items-center justify-center pt-24">
        <div className="text-center max-w-md p-8 glass-card rounded-2xl">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={24} />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Module</h1>
          <p className="text-muted-foreground mb-6">{fetchError}</p>
          <Button onClick={() => navigate('/modules')} variant="outline" className="w-full">
            <ArrowLeft className="mr-2" size={16} />
            Back to Modules
          </Button>
        </div>
      </div>
      </div>
    );
  }

  // --- Dossier Detail View ---
  if (moduleData && !selectedLesson) {
    // Fallback global
    if (!moduleData || typeof moduleData !== 'object') {
      return <div className="text-red-500">Erreur critique : moduleData absent ou corrompu.</div>;
    }
    // Debug logs
    console.log('moduleData', moduleData);

    const lessons = [...(Array.isArray(allLessons) ? allLessons : [])].sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
    const completedLessonIds = new Set(lessons.filter(l => l.completed).map(l => l.id));
    console.log("Sorted lessons:", lessons); // Log sorted lessons
    console.log("Completed Lesson IDs:", Array.from(completedLessonIds)); // Log completed IDs

    let nextLessonToUnlockIndex = 0;
    for (let i = 0; i < lessons.length; i++) {
      if (!completedLessonIds.has(lessons[i].id)) {
        nextLessonToUnlockIndex = i;
        break;
      }
      nextLessonToUnlockIndex = i + 1; // If all before are complete, next one is unlockable
    }
    console.log("Next lesson to unlock index:", nextLessonToUnlockIndex); // Log next unlock index

    const isProf = user?.role === 'professeur';

    // Fallbacks pour les propriétés potentiellement absentes
    // const lessons = allLessons; // This line is now redundant after sorting and re-declaring `lessons` above.

    const handleSaveDetail = async () => {
      try {
        const res = await fetch(`${API_BASE}/modules/${moduleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titre: editDetailData.titre,
            description: editDetailData.description,
            id_module: Number(moduleId)
          })
        });
        if (!res.ok) throw new Error('Erreur lors de la modification du module');
        setModuleData({ titre: editDetailData.titre, description: editDetailData.description });
        setEditingDetail(false);
      } catch (err) {
        alert('Erreur lors de la modification du module');
      }
    };

    // Handler pour ouvrir l'édition d'une leçon
    const handleEditLesson = (lesson: Lesson) => {
      setSelectedLessonEdit(lesson);
      setEditLessonData({
        title: lesson.title,
        content: lesson.content,
        videoUrl: lesson.videoUrl || "",
      });
    };

    // Handler pour sauvegarder l'édition d'une leçon
    const handleSaveLessonEdit = async () => {
      if (!selectedLessonEdit) return;
      try {
        const res = await fetch(`${API_BASE}/lessons/${selectedLessonEdit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titre: editLessonData.title,
            contenu: editLessonData.content,
            videoUrl: editLessonData.videoUrl,
            id_module: moduleId,
            id_enseignant: user?.id,
          }),
        });
        if (!res.ok) throw new Error("Erreur lors de la modification de la leçon");
        // Met à jour la leçon dans la liste
        setAllLessons(prev => prev.map(l => l.id === selectedLessonEdit.id ? {
            ...l,
            title: editLessonData.title,
            content: editLessonData.content,
            videoUrl: editLessonData.videoUrl,
          } : l));
        setSelectedLessonEdit(null);
      } catch (err) {
        alert("Erreur lors de la modification de la leçon");
      }
    };

    // Fonction utilitaire pour extraire la description d'une leçon
    function getLessonDescription(lesson: Lesson) {
      if (lesson.description && lesson.description.trim() !== '') return lesson.description;
      if (lesson.content && typeof lesson.content === 'string') {
        try {
          const blocks = JSON.parse(lesson.content);
          const firstTextBlock = Array.isArray(blocks) && blocks.find(b => b.type === 'text');
          if (firstTextBlock && firstTextBlock.content && firstTextBlock.content.content) {
            return firstTextBlock.content.content.slice(0, 120) + (firstTextBlock.content.content.length > 120 ? '...' : '');
          }
        } catch (_e) { /* ignore parse errors */ }
      }
      if (lesson.content && typeof lesson.content === 'string') {
        try {
          const blocks = JSON.parse(lesson.content);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const firstTextBlock = Array.isArray(blocks) && blocks.find((b: any) => b.type === 'text');
          if (firstTextBlock && firstTextBlock.content && firstTextBlock.content.content) {
            return firstTextBlock.content.content.slice(0, 120) + (firstTextBlock.content.content.length > 120 ? '...' : '');
          }
        } catch (_e) { /* ignore parse errors */ }
      }
      return '';
    }

    // Fonction pour supprimer une leçon
    const handleDeleteLesson = async (lessonId: string) => {
      if (!window.confirm("Supprimer cette leçon ?")) return;
      try {
        await fetch(`${API_BASE}/lessons/${lessonId}`, { method: "DELETE" });
        // Met à jour la liste locale
        setAllLessons(prev => prev.filter(l => l.id !== lessonId));
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    };

    // Add this handler in the component
    // const handleToggleLessonCompleted = (lessonId: string) => {
    //   setAllLessons(prev => prev.map(l =>
    //       l.id === lessonId ? { ...l, completed: !l.completed } : l
    //     ));
    // };

    // Edit Module Dialog
    const editModuleDialog = (
      <Dialog open={showEditModule} onOpenChange={setShowEditModule}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditModule}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Module Title</Label>
                <Input
                  id="title"
                  value={editModuleData.title}
                  onChange={(e) => setEditModuleData({...editModuleData, title: e.target.value})}
                  placeholder="Module Title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editModuleData.description}
                  onChange={(e) => setEditModuleData({...editModuleData, description: e.target.value})}
                  placeholder="Module Description"
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditModule(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );

    return (
      <div className="relative min-h-screen bg-[#FAF9F6] text-slate-800 font-sans overflow-x-hidden flex flex-col">
        {/* Math Dot Grid Background Canvas */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.16) 1.2px, transparent 1.2px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Ambient Glowing Pastel Orbs (Animated like homepage) */}
        <div
          className="fixed -top-12 -left-12 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-orange-300/35 via-amber-200/20 to-transparent blur-3xl pointer-events-none z-0 animate-pulse"
          style={{ animationDuration: '6s' }}
        />
        <div
          className="fixed -top-10 right-0 w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-amber-300/40 via-orange-200/25 to-transparent blur-3xl pointer-events-none z-0 animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        <div
          className="fixed top-[380px] -right-16 w-[480px] h-[480px] rounded-full bg-gradient-to-tl from-indigo-300/30 via-purple-200/15 to-transparent blur-3xl pointer-events-none z-0 animate-pulse"
          style={{ animationDuration: '10s' }}
        />
        <div
          className="fixed bottom-20 left-10 w-96 h-96 bg-gradient-to-tr from-emerald-200/20 via-teal-100/15 to-transparent rounded-full blur-3xl pointer-events-none z-0 animate-pulse"
          style={{ animationDuration: '7s' }}
        />

        <HomeNavbar scrolled={scrolled} />

        <div className="relative z-10 pt-28 pb-16 px-4 sm:px-8 w-full max-w-6xl mx-auto flex-1">
          {editModuleDialog}

          {/* Back to Modules Button */}
          <button 
            onClick={() => { setSelectedLesson(null); navigate('/modules'); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 border-2 border-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] text-xs font-bold transition-all mb-6 group hover:-translate-y-0.5 active:scale-98 backdrop-blur-md"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform text-amber-600" />
            <span>Back to Modules</span>
          </button>

          {/* ── Header + Stats Bar in Bright White Card ───────────────────── */}
          <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] p-7 sm:p-9 border-2 border-white shadow-[0_16px_40px_rgba(0,0,0,0.05),0_2px_8px_rgba(0,0,0,0.02)] mb-8 relative overflow-hidden">
            {/* Subtle Book watermark accent */}
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none select-none text-slate-900">
              <BookOpen size={130} />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-7">
              <div className="flex-1 min-w-0 max-w-3xl">
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <BookOpen size={22} className="text-blue-600" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    {moduleData?.titre}
                  </h1>
                  {user?.role === 'professeur' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 h-8 w-8 rounded-xl text-stone-400 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        setEditModuleData({
                          title: moduleData?.titre || '',
                          description: moduleData?.description || ''
                        });
                        setShowEditModule(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-medium">
                  {moduleData?.description}
                </p>
              </div>

              {user?.role === 'professeur' && (
                <Button
                  className="self-start rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20"
                  onClick={() => navigate(`/lesson/new/${moduleId}`)}
                >
                  <Plus size={16} className="mr-2" /> Add Lesson
                </Button>
              )}
            </div>

            {/* Progress & Stats Row */}
            <div className="relative z-10 pt-6 border-t border-stone-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="w-full lg:w-1/3 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-stone-500">Overall Progress</span>
                  <span className="text-blue-600 font-extrabold text-base">
                    {moduleProgress ? Math.round(moduleProgress.overall_progress) : 0}%
                  </span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden border border-stone-200/70 p-0.5">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${moduleProgress ? moduleProgress.overall_progress : 0}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-stone-50/90 border border-stone-200/80 rounded-2xl p-3 sm:px-5">
                <div className="text-center pr-4 border-r border-stone-200/80">
                  <div className="text-lg font-black text-slate-900 leading-tight">
                    {allLessons.filter(l => l.completed).length}/{allLessons.length}
                  </div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Lessons Done</div>
                </div>
                <div className="text-center pr-4 border-r border-stone-200/80">
                  <div className="text-lg font-black text-indigo-600 leading-tight">
                    {moduleProgress ? `${moduleProgress.watched_videos}/${moduleProgress.total_videos}` : `0/${allLessons.length}`}
                  </div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Videos Watched</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-black text-emerald-600 leading-tight">
                    {moduleProgress ? `${Math.round(moduleProgress.quiz_score)}%` : '0%'}
                  </div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Quiz Score</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Modern Tabs Bar in White Card ─────────────────────────────── */}
          <div className="inline-flex items-center gap-1.5 p-1.5 bg-white/90 backdrop-blur-xl rounded-2xl border-2 border-white shadow-[0_8px_20px_rgba(0,0,0,0.03)] mb-6">
            <button
              className={`flex items-center gap-2 py-2 px-5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'lecons'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
              onClick={() => setActiveTab('lecons')}
            >
              <Play className={`w-3.5 h-3.5 ${activeTab === 'lecons' ? 'fill-white' : ''}`} />
              <span>Lessons</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'lecons' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
              }`}>
                {lessons.length}
              </span>
            </button>
            <button
              className={`flex items-center gap-2 py-2 px-5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'quiz'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
              onClick={() => setActiveTab('quiz')}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Quizzes</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'quiz' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
              }`}>
                0
              </span>
            </button>
          </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'lecons' && (
            lessons.length === 0 ? (
              <div className="text-center text-muted-foreground py-16 glass-card rounded-2xl border border-dashed border-border">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No lessons available yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson, index) => {
                  const isCompleted = lesson.completed;
                  const isCurrent = index === nextLessonToUnlockIndex && !isCompleted;
                  const isLocked = index > nextLessonToUnlockIndex && !isProf;
                  const stepNum = String(index + 1).padStart(2, '0');

                  return (
                    <div key={lesson.id} className="relative flex items-start gap-3 sm:gap-5 group">
                      {/* Vertical Roadmap Rail */}
                      <div className="flex flex-col items-center self-stretch shrink-0 pt-1">
                        {/* Numbered Step Circle */}
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black text-xs sm:text-sm transition-all duration-300 shadow-md ${
                            isCompleted
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20'
                              : isCurrent
                              ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-500/30 ring-4 ring-blue-500/15 scale-105'
                              : 'bg-stone-100 text-stone-400 border-2 border-stone-200'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          ) : isLocked ? (
                            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400" />
                          ) : (
                            <span>{stepNum}</span>
                          )}
                        </div>

                        {/* Timeline connector to next step */}
                        {index < lessons.length - 1 && (
                          <div
                            className={`w-0.5 flex-1 my-2 transition-colors ${
                              isCompleted ? 'bg-emerald-300' : 'bg-stone-200'
                            }`}
                          />
                        )}
                      </div>

                      {/* Main Lesson Card Surface */}
                      <div
                        onClick={() => (!isLocked || isProf) && navigate(`/lesson-view/${lesson.id}/${moduleId}`)}
                        className={`flex-1 rounded-[24px] p-5 sm:p-6 transition-all duration-300 border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${
                          isLocked
                            ? 'bg-stone-50/70 border-stone-200/60 opacity-65 cursor-not-allowed'
                            : isCurrent
                            ? 'bg-white border-blue-400/90 shadow-[0_16px_36px_rgba(59,130,246,0.12)] hover:shadow-[0_20px_44px_rgba(59,130,246,0.16)] cursor-pointer hover:-translate-y-0.5'
                            : 'bg-white/95 backdrop-blur-xl border-white shadow-[0_12px_28px_rgba(0,0,0,0.04)] hover:shadow-[0_18px_36px_rgba(0,0,0,0.08)] hover:border-blue-200 cursor-pointer hover:-translate-y-0.5'
                        }`}
                      >
                        {/* Info Column */}
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Top Meta Badges Row */}
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Status Pill */}
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Terminée
                              </span>
                            ) : isCurrent ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                Étape active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-500 border border-stone-200">
                                <Lock className="w-3 h-3 text-stone-400" />
                                Verrouillée
                              </span>
                            )}

                            {/* Duration Badge */}
                            {lesson.duration && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-50 text-stone-600 border border-stone-200/80">
                                <Clock className="w-3 h-3 text-stone-400" />
                                {lesson.duration}
                              </span>
                            )}

                            {/* Video Badge */}
                            {lesson.videoUrl && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                                <Play className="w-3 h-3 text-amber-600 fill-amber-600" />
                                Vidéo Manim
                              </span>
                            )}
                          </div>

                          {/* Lesson Title */}
                          <h3 className={`text-base sm:text-lg font-black tracking-tight leading-snug transition-colors ${
                            isCurrent ? 'text-blue-900 group-hover:text-blue-600' : 'text-slate-900 group-hover:text-blue-600'
                          }`}>
                            {lesson.title}
                          </h3>

                          {/* Lesson Description */}
                          <p className="text-xs text-stone-500 font-medium line-clamp-2 leading-relaxed">
                            {lesson.description || "Visualisez l'algorithme pas à pas et approfondissez la théorie mathématique."}
                          </p>
                        </div>

                        {/* Right Action / CTA Area */}
                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          {/* Professor Action buttons */}
                          {!isLocked && isProf && (
                            <div className="flex items-center gap-1 mr-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-stone-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                                onClick={e => { e.stopPropagation(); navigate(`/lesson/${lesson.id}/${moduleId}`); }}
                                title="Modifier la leçon"
                              >
                                <Edit size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                                onClick={e => { e.stopPropagation(); handleDeleteLesson(lesson.id); }}
                                title="Supprimer la leçon"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          )}

                          {/* Primary Action Button */}
                          {isCompleted ? (
                            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold transition-all shadow-2xs group-hover:scale-102">
                              <span>Revoir</span>
                              <ChevronRight className="w-4 h-4 text-stone-500 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          ) : isCurrent ? (
                            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all group-hover:shadow-lg group-hover:scale-102">
                              <span>Commencer</span>
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-400 text-xs font-semibold">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Bloqué</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
          {activeTab === 'quiz' && (
            <QuizSection userId={user?.id} />
          )}
        </div>

        {/* Selected Lesson Read-Only View fallback (rarely used if they route) */}
        {selectedLesson && (
          <div className="mt-12 glass-card rounded-2xl overflow-hidden border border-border">
            <div className="p-8">
              <Button variant="ghost" onClick={() => setSelectedLesson(null)} className="mb-6 -ml-4 subtle-hover">
                <ArrowLeft className="mr-2" size={16} /> Back to lessons list
              </Button>
              
              <h2 className="text-3xl font-bold text-foreground mb-4">{selectedLesson.title}</h2>
              
              <div className="flex items-center gap-4 mb-8">
                {selectedLesson.duration && (
                  <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    <Clock size={16} /> {selectedLesson.duration}
                  </span>
                )}
                {selectedLesson.completed && (
                  <span className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-500/10 px-3 py-1 rounded-full">
                    <CheckCircle size={16} /> Completed
                  </span>
                )}
              </div>

              {selectedLesson.videoUrl && (
                <div className="w-full aspect-video bg-black rounded-xl overflow-hidden mb-8 shadow-xl">
                  <video controls className="w-full h-full object-cover">
                    <source src={selectedLesson.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
              
              {!selectedLesson.videoUrl && (
                <div className="w-full aspect-video bg-muted/30 border border-dashed border-border rounded-xl flex flex-col items-center justify-center mb-8 text-muted-foreground">
                  <Play size={48} className="mb-4 opacity-20" />
                  <p>Interactive simulation or video coming soon</p>
                </div>
              )}

              <div className="prose prose-blue dark:prose-invert max-w-none mb-12">
                {selectedLesson.content}
              </div>

              {selectedLesson.objectives && selectedLesson.objectives.length > 0 && (
                <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                  <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                    <Brain size={20} /> Learning Objectives
                  </h3>
                  <ul className="space-y-3">
                    {selectedLesson.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-3 text-muted-foreground">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                          {i + 1}
                        </div>
                        <span className="leading-relaxed">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    );
  }

  // --- Lesson Detail View ---
  if (selectedLesson) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col font-sans">
        <HomeNavbar scrolled={scrolled} />
        <div className="pt-24 pb-16 px-6 sm:px-10 w-full max-w-5xl mx-auto flex-1">
        <button 
          onClick={() => setSelectedLesson(null)}
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center mr-3 group-hover:bg-muted transition-colors">
            <ArrowLeft size={16} />
          </div>
          Back to Module
        </button>

        <div className="glass-card rounded-2xl overflow-hidden border border-border">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Play size={20} />
              </div>
              {selectedLesson.title}
            </h2>
            
            <div className="flex items-center gap-4 mb-8">
              {selectedLesson.duration && (
                <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  <Clock size={16} /> {selectedLesson.duration}
                </span>
              )}
              {selectedLesson.completed ? (
                <span className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-500/10 px-3 py-1 rounded-full">
                  <CheckCircle size={16} /> Completed
                </span>
              ) : (
                <span className="flex items-center gap-2 text-sm font-medium text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full">
                  <Play size={16} /> To Watch
                </span>
              )}
            </div>

            <div className="w-full aspect-video bg-muted/30 border border-dashed border-border rounded-xl flex flex-col items-center justify-center mb-8 text-muted-foreground">
              <Play size={48} className="mb-4 opacity-20" />
              <p>Interactive simulation or video coming soon</p>
            </div>

            <div className="prose prose-blue dark:prose-invert max-w-none mb-12 text-muted-foreground leading-relaxed">
              {selectedLesson.content}
            </div>

            {selectedLesson.objectives && selectedLesson.objectives.length > 0 && (
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                  <Brain size={20} /> Learning Objectives
                </h3>
                <ul className="space-y-3">
                  {selectedLesson.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                        {i + 1}
                      </div>
                      <span className="leading-relaxed">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  }

  return null;
};

// Helper to map backend lesson fields to frontend fields
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapLesson = (lesson: any): Lesson => ({
  id: lesson.id,
  title: lesson.titre ?? lesson.title ?? '',
  content: lesson.contenu ?? lesson.content ?? '',
  duration: lesson.duree ?? lesson.duration ?? '',
  objectives: lesson.objectifs ?? [],
  videoUrl: lesson.videoUrl ?? '',
  completed: lesson.completed ?? false, // Ensure this is correctly mapped
  description: lesson.description ?? '',
  niveau: lesson.niveau ?? '',
  ordre: lesson.ordre ?? 0,
});

export default Module;
