import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MapPin, Send, CheckCircle2, AlertCircle, BookOpen, FlaskConical } from 'lucide-react';
import HomeNavbar from '@/components/HomeNavbar';
import PublicFooter from '@/components/PublicFooter';

type Status = 'idle' | 'sending' | 'sent' | 'error';
type Form = { name: string; email: string; subject: string; message: string };

export default function ContactPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [form, setForm] = useState<Form>({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus('sending');
    setTimeout(() => setStatus('sent'), 1200);
  };

  const inputClass = `w-full h-9 px-3 text-sm bg-white border border-border rounded
    focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition`;
  const labelClass = 'block text-xs font-medium text-foreground mb-1';

  return (
    <div className="min-h-screen bg-transparent text-foreground font-sans overflow-x-hidden">
      <HomeNavbar scrolled={scrolled} />

      {/* Header */}
      <section className="pt-[54px] pb-8 border-b border-border">
        <div className="section-container animate-fade-up">
          <div className="section-label">Contact</div>
          <h1 className="heading-xl mt-3 mb-3">Get in touch</h1>
          <p className="text-muted-foreground text-sm max-w-md">
            Bug report, feature request, or a question about a method — we're happy to help.
          </p>
        </div>
      </section>

      <main className="section-container py-12">
        <div className="grid md:grid-cols-5 gap-12">

          {/* Form */}
          <div className="md:col-span-3">
            {status === 'sent' ? (
              <div className="border border-border rounded-lg p-10 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Message sent</h3>
                <p className="text-sm text-muted-foreground mb-5">We'll get back to you as soon as possible.</p>
                <button
                  className="btn-ghost text-xs"
                  onClick={() => { setStatus('idle'); setForm({ name:'', email:'', subject:'', message:'' }); }}
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Name *</label>
                    <input type="text" required value={form.name} onChange={set('name')} placeholder="Your name" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Subject</label>
                  <select value={form.subject} onChange={set('subject')}
                    className={`${inputClass} cursor-pointer`}>
                    <option value="">Select a topic…</option>
                    <option>Bug report</option>
                    <option>Feature request</option>
                    <option>Question about a method</option>
                    <option>Collaboration</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Message *</label>
                  <textarea required rows={5} value={form.message} onChange={set('message')}
                    placeholder="Describe your question or issue…"
                    className="w-full px-3 py-2 text-sm bg-white border border-border rounded resize-none
                      focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition" />
                </div>
                {status === 'error' && (
                  <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded px-3 py-2">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Something went wrong. Please try again.
                  </div>
                )}
                <button type="submit" disabled={status === 'sending'} className="btn-primary">
                  <Send className="h-3.5 w-3.5" />
                  {status === 'sending' ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar info */}
          <div className="md:col-span-2 space-y-5">
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-3">Contact info</h3>
              <div className="space-y-2">
                {[
                  { icon: Mail,    label: 'numiviz@esprit.tn' },
                  { icon: MapPin,  label: 'ESPRIT, Tunis, Tunisia' },
                ].map(c => (
                  <div key={c.label} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <c.icon className="h-4 w-4 text-primary shrink-0" />
                    {c.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="divider" />

            <div className="space-y-3">
              <p className="text-xs font-medium text-foreground">Looking for help?</p>
              <p className="text-xs text-muted-foreground">Most questions are answered in the Guide.</p>
              <button
                className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                onClick={() => navigate('/guide')}
              >
                <BookOpen className="h-3.5 w-3.5" /> Read the Guide
              </button>
              <button
                className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                onClick={() => navigate('/tools')}
              >
                <FlaskConical className="h-3.5 w-3.5" /> Open the Lab
              </button>
            </div>

            <div className="divider" />

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Typical response time: 24 hours
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
