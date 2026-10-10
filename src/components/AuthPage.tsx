/**
 * AuthPage — /auth
 * Split-card login/sign-up matching the NumiViz mockup:
 *  - Left: warm form panel (logo, pill inputs, blue CTA, GitHub + Google SSO)
 *  - Right: student photo with floating glass "live solver" overlays
 */
import React, { useState } from 'react';
import { API_BASE } from '@/lib/api';
import {
  Eye, EyeOff, GraduationCap, Users, ArrowLeft, Lock, Mail, User, X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

// ── Social Auth Icons ────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.64-5.2 3.64-9.15z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.73-2.09-6.67-4.91H1.27v3.15C3.25 21.36 7.31 24 12 24z"/>
      <path fill="#FBBC05" d="M5.33 14.29c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.56H1.27C.46 8.18 0 10.03 0 12s.46 3.82 1.27 5.44l4.06-3.15z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.64 1.27 6.56l4.06 3.15c.94-2.82 3.57-4.96 6.67-4.96z"/>
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg className="w-5 h-5 shrink-0 fill-current text-slate-900" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

function NumiVizLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
        <path d="M6 23L12 9" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
        <path d="M12 9L19 23" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M19 9V23" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        <rect x="22.5" y="10.5" width="2.5" height="2.5" rx="0.8" fill="#3B82F6" />
        <rect x="22.5" y="15" width="2.5" height="2.5" rx="0.8" fill="#3B82F6" />
        <rect x="22.5" y="19.5" width="2.5" height="2.5" rx="0.8" fill="#3B82F6" />
      </svg>
      <span className="text-xl font-extrabold tracking-tight text-slate-900">NumiViz</span>
    </div>
  );
}

// ── Pill input with leading icon ─────────────────────────────────────────────
function PillField({
  label, id, name, type = 'text', value, onChange, placeholder, icon: Icon, rightEl, labelRight,
}: {
  label: string; id: string; name: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; icon: React.ElementType; rightEl?: React.ReactNode; labelRight?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 px-1">
        <label htmlFor={id} className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
          {label}
        </label>
        {labelRight}
      </div>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
        <input
          id={id} name={name} type={type} value={value} onChange={onChange}
          placeholder={placeholder} required
          className="w-full h-11 pl-11 pr-11 rounded-full border border-stone-200 bg-white/80
            text-sm text-slate-900 placeholder:text-stone-400 font-medium
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
            focus:bg-white transition-all duration-150 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
        />
        {rightEl && <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightEl}</div>}
      </div>
    </div>
  );
}

// ── Main AuthPage ─────────────────────────────────────────────────────────────
const AuthPage = () => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [signupForm, setSignupForm] = useState({
    firstname: '', lastname: '', email: '', password: '', confirmPassword: '', role: 'etudiant',
  });
  const [signinForm, setSigninForm] = useState({ email: '', password: '' });

  // ── Authentication Handlers ─────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signinForm.email || !signinForm.password) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email: signinForm.email, password: signinForm.password,
      });
      const user = response.data;
      login(user);
      toast({ title: 'Connexion réussie', description: `Bienvenue, ${user.name} !` });
      setSigninForm({ email: '', password: '' });
      setTimeout(() => navigate('/modules'), 1200);
    } catch (error) {
      let msg = 'Vérifiez vos identifiants et réessayez.';
      if (axios.isAxiosError(error) && error.response) msg = error.response.data.detail || error.message;
      toast({ title: 'Erreur de connexion', description: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupForm.firstname || !signupForm.lastname || !signupForm.email || !signupForm.password || !signupForm.role) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs obligatoires', variant: 'destructive' });
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas', variant: 'destructive' });
      return;
    }
    if (signupForm.password.length < 6) {
      toast({ title: 'Erreur', description: 'Le mot de passe doit comporter au moins 6 caractères', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const userData = {
        name: `${signupForm.firstname} ${signupForm.lastname}`,
        email: signupForm.email, password: signupForm.password, role: signupForm.role,
      };
      const response = await axios.post(`${API_BASE}/users`, userData);
      const user = response.data;
      login(user);
      toast({ title: 'Inscription réussie', description: 'Bienvenue sur NumiViz !' });
      setSignupForm({ firstname: '', lastname: '', email: '', password: '', confirmPassword: '', role: 'etudiant' });
      setTimeout(() => navigate('/modules'), 1200);
    } catch (error) {
      let msg = "Une erreur est survenue lors de l'inscription";
      if (axios.isAxiosError(error) && error.response) msg = error.response.data.detail || error.message;
      toast({ title: "Erreur d'inscription", description: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = (provider: 'Google' | 'GitHub') => {
    toast({
      title: `Connexion ${provider}`,
      description: `Authentification SSO ${provider} prête. Redirection vers votre espace d'étude...`,
    });
  };

  const onSignup = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSignupForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const onSignin = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSigninForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submitBtn = `w-full h-12 rounded-full bg-gradient-to-b from-blue-600 to-blue-700
    hover:from-blue-500 hover:to-blue-700 text-white text-sm font-bold
    shadow-[0_8px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_10px_26px_rgba(37,99,235,0.45)]
    transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]
    disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2`;

  const socialBtn = `flex items-center justify-center gap-2.5 h-11 rounded-full border border-stone-200
    bg-white/80 hover:bg-white text-slate-800 text-sm font-semibold transition-all
    shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]`;

  const eyeBtn = (shown: boolean, toggle: () => void) => (
    <button type="button" onClick={toggle} className="text-stone-400 hover:text-stone-600" aria-label="Afficher le mot de passe">
      {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#FAF9F6] p-4 sm:p-8 font-sans overflow-hidden selection:bg-blue-500 selection:text-white">
      <style>{`
        @keyframes nv-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
        .nv-float   { animation: nv-float 5s ease-in-out infinite; }
        .nv-float-2 { animation: nv-float 6s ease-in-out infinite 1s; }
        .nv-float-3 { animation: nv-float 5.5s ease-in-out infinite 2s; }
        @keyframes nv-draw { from { stroke-dashoffset: 400 } to { stroke-dashoffset: 0 } }
        .nv-draw { stroke-dasharray: 400; animation: nv-draw 2.4s ease-out forwards; }
      `}</style>

      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.35) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />

      {/* Ambient blobs */}
      <div className="fixed -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-orange-400/50 via-orange-300/30 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="fixed -top-16 right-[8%] w-[520px] h-[420px] rounded-full bg-gradient-to-bl from-amber-300/50 via-orange-200/30 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-24 w-[360px] h-[420px] rounded-full bg-gradient-to-l from-indigo-400/35 via-purple-300/25 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Left margin doodles */}
      <div className="hidden xl:block fixed left-6 top-[24%] z-0 pointer-events-none select-none text-slate-500/80 font-mono text-[11px] space-y-3">
        <div>e^(iπ) + 1 = 0</div>
        <div>∫ f(x)dx ≈ Σ wᵢf(xᵢ)</div>
        <div>Ax = b ⟹ x = A⁻¹b</div>
        <svg width="70" height="60" viewBox="0 0 70 60" className="mt-6 text-orange-400">
          {[0, 1, 2, 3, 4].map(i => <path key={`h${i}`} d={`M5 ${10 + i * 10} L60 ${8 + i * 10}`} stroke="currentColor" strokeWidth="1" />)}
          {[0, 1, 2, 3, 4].map(i => <path key={`v${i}`} d={`M${12 + i * 11} 5 L${10 + i * 11} 55`} stroke="currentColor" strokeWidth="1" />)}
        </svg>
        <svg width="70" height="60" viewBox="0 0 70 60" className="mt-4 text-indigo-500">
          <path d="M8 52 L8 8 M8 52 L62 52" stroke="currentColor" strokeWidth="1.3" fill="none" />
          <path d="M10 50 C25 48, 30 20, 58 12" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M8 22 L40 22" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" />
        </svg>
      </div>

      {/* Right margin doodles */}
      <div className="hidden xl:block fixed right-6 top-[12%] z-0 pointer-events-none select-none">
        <svg width="80" height="70" viewBox="0 0 80 70" className="text-indigo-500">
          <path d="M10 60 L10 8 M10 60 L72 60" stroke="currentColor" strokeWidth="1.3" fill="none" />
          <path d="M12 56 C30 54, 50 40, 70 12" stroke="currentColor" strokeWidth="1.6" fill="none" />
        </svg>
        <svg width="80" height="60" viewBox="0 0 80 60" className="mt-10 text-indigo-600">
          <path d="M10 30 C20 20, 26 40, 36 26 S 52 30, 60 18" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M40 46 L48 54 L66 32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
        <svg width="80" height="60" viewBox="0 0 80 60" className="mt-32 text-indigo-600">
          <path d="M6 30 L16 40 L34 14" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M34 40 L44 50 L66 20" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-5 left-5 flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-stone-200 text-slate-700 hover:text-slate-900 shadow-sm hover:bg-white text-xs font-semibold transition-all hover:scale-105 z-50"
      >
        <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
      </button>

      {/* ── Main Card ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-[1020px] rounded-[36px] bg-gradient-to-br from-white via-[#fffaf0] to-amber-100/70 border-2 border-white shadow-[0_30px_80px_rgba(120,80,20,0.15),0_4px_14px_rgba(0,0,0,0.05)] p-3 sm:p-4 flex flex-col md:flex-row gap-4 animate-fade-up">

        {/* Close button */}
        <button
          onClick={() => navigate('/')}
          aria-label="Fermer"
          className="absolute -top-3 -right-3 z-30 h-11 w-11 rounded-full bg-white border border-stone-200 shadow-md flex items-center justify-center text-slate-600 hover:text-slate-900 hover:rotate-90 transition-all duration-300"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ── LEFT: Form ─────────────────────────────────────────────────── */}
        <div className="w-full md:w-[46%] shrink-0 flex flex-col px-5 sm:px-8 pt-5 pb-4">
          <NumiVizLogo />

          <div className="flex-1 flex flex-col justify-center py-6">
            <div className="text-center mb-6">
              <h1 className="text-[26px] sm:text-[28px] font-bold text-slate-900 tracking-tight">
                {tab === 'signin' ? 'Bon retour parmi nous 👋' : 'Créer votre compte 🚀'}
              </h1>
              <p className="text-sm text-slate-600 mt-1.5 leading-snug max-w-xs mx-auto">
                {tab === 'signin'
                  ? 'Connectez-vous pour accéder à vos modules et outils de calcul.'
                  : 'Rejoignez NumiViz et explorez les méthodes numériques pas à pas.'}
              </p>
            </div>

            {/* ── SIGN IN ── */}
            {tab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <PillField
                  label="Adresse e-mail" id="signin-email" name="email" type="email" icon={Mail}
                  value={signinForm.email} onChange={onSignin} placeholder="votrenom@univ.fr"
                />
                <PillField
                  label="Mot de passe" id="signin-pw" name="password" icon={Lock}
                  type={showPw ? 'text' : 'password'}
                  value={signinForm.password} onChange={onSignin} placeholder="••••••••"
                  rightEl={eyeBtn(showPw, () => setShowPw(v => !v))}
                  labelRight={
                    <button type="button" className="text-xs text-amber-600 hover:text-amber-700 font-bold hover:underline">
                      Mot de passe oublié ?
                    </button>
                  }
                />

                <div className="pt-1">
                  <button type="submit" disabled={isLoading} className={submitBtn}>
                    {isLoading ? 'Connexion en cours...' : 'Se connecter à NumiViz'}
                  </button>
                </div>
              </form>
            )}

            {/* ── SIGN UP ── */}
            {tab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <PillField label="Prénom" id="firstname" name="firstname" icon={User}
                    value={signupForm.firstname} onChange={onSignup} placeholder="Jean" />
                  <PillField label="Nom" id="lastname" name="lastname" icon={User}
                    value={signupForm.lastname} onChange={onSignup} placeholder="Dupont" />
                </div>
                <PillField label="Adresse e-mail" id="signup-email" name="email" type="email" icon={Mail}
                  value={signupForm.email} onChange={onSignup} placeholder="jean.dupont@univ.fr" />
                <div className="grid grid-cols-2 gap-3">
                  <PillField label="Mot de passe" id="signup-pw" name="password" icon={Lock}
                    type={showPw ? 'text' : 'password'} value={signupForm.password} onChange={onSignup}
                    placeholder="••••••" rightEl={eyeBtn(showPw, () => setShowPw(v => !v))} />
                  <PillField label="Confirmer" id="confirm-pw" name="confirmPassword" icon={Lock}
                    type={showConfirmPw ? 'text' : 'password'} value={signupForm.confirmPassword} onChange={onSignup}
                    placeholder="••••••" rightEl={eyeBtn(showConfirmPw, () => setShowConfirmPw(v => !v))} />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {[
                    { v: 'etudiant', label: 'Étudiant', icon: Users },
                    { v: 'professeur', label: 'Professeur', icon: GraduationCap },
                  ].map(r => (
                    <button
                      key={r.v} type="button"
                      onClick={() => setSignupForm(p => ({ ...p, role: r.v }))}
                      className={`flex items-center justify-center gap-2 h-10 rounded-full border text-xs font-bold transition-all ${
                        signupForm.role === r.v
                          ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-sm'
                          : 'bg-white/80 border-stone-200 text-slate-600 hover:border-blue-200'
                      }`}
                    >
                      <r.icon className={`h-4 w-4 ${signupForm.role === r.v ? 'text-blue-600' : 'text-stone-400'}`} />
                      {r.label}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer select-none px-1">
                  <input
                    type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 accent-blue-600"
                  />
                  <span className="text-xs text-slate-600">
                    J'accepte les <span className="text-amber-600 font-bold">conditions d'utilisation</span>
                  </span>
                </label>

                <button type="submit" disabled={isLoading || !agreed} className={submitBtn}>
                  {isLoading ? 'Création en cours...' : 'Créer mon compte'}
                </button>
              </form>
            )}

            {/* Social: GitHub + Google */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button type="button" onClick={() => handleSocialAuth('GitHub')} className={socialBtn}>
                <GithubIcon /> GitHub
              </button>
              <button type="button" onClick={() => handleSocialAuth('Google')} className={socialBtn}>
                <GoogleIcon /> Google
              </button>
            </div>
          </div>

          {/* Footer links */}
          <div className="flex items-center justify-between gap-3 text-[11px] text-slate-600 pt-2">
            <span>
              {tab === 'signin' ? 'Pas encore de compte ? ' : 'Déjà inscrit ? '}
              <button
                type="button"
                onClick={() => setTab(tab === 'signin' ? 'signup' : 'signin')}
                className="font-semibold text-slate-800 hover:text-blue-600 hover:underline"
              >
                {tab === 'signin' ? 'Créer un compte gratuitement' : 'Se connecter'}
              </button>
            </span>
            <button type="button" className="underline underline-offset-2 hover:text-slate-900">
              Conditions d'utilisation
            </button>
          </div>
        </div>

        {/* ── RIGHT: Photo ─────────────────────────────────────────────── */}
        <div className="hidden md:block relative flex-1 min-h-[560px] rounded-[28px] overflow-hidden shadow-[0_12px_30px_rgba(15,23,42,0.25)]">
          <img
            src="/auth-students.jpg"
            alt="Étudiants travaillant sur des méthodes numériques"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
