import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, BookOpen, Users, BarChart3, Calendar as CalendarIcon, FileText, PlusCircle, CheckCircle, AlertTriangle, Trash2, Loader2, RefreshCw } from 'lucide-react';import { StudentSuccessRates, mockStudentSuccessData } from '@/components/dashboard/StudentSuccessRates';
import { useAuth } from '@/contexts/AuthContext';

// --- Types ---
interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  type: 'exam' | 'assignment' | 'reminder';
  id_enseignant: number;
}

interface ModuleSuccess {
  id_module: number;
  name: string;
  successRate: number;
}

interface DashboardStats {
  totalStudents: number;
  activeModules: number;
  averageSuccessRate: number;
  assignmentsToGrade: number;
  moduleSuccess: ModuleSuccess[];
}

// --- Main Component ---
export default function ProfessorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'reminder' as CalendarEvent['type'] });

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Fetch stats and events in parallel
      const [statsResponse, eventsResponse] = await Promise.all([
        fetch(`${API_BASE}/api/dashboard/stats/${user.id}`),
        fetch(`${API_BASE}/api/events/${user.id}`)
      ]);

      if (!statsResponse.ok) throw new Error('Failed to fetch dashboard stats');
      if (!eventsResponse.ok) throw new Error('Failed to fetch events');

      const statsData = await statsResponse.json();
      const eventsData = await eventsResponse.json();

      setStats(statsData);
      setEvents(eventsData);

    } catch (error) {
      console.error(error);
      // You might want to set an error state here to show in the UI
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveEvent = async () => {
    if (!user || !newEvent.title || !newEvent.date) {
      alert("Le titre et la date sont obligatoires.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEvent, id_enseignant: user.id }),
      });
      if (!response.ok) throw new Error('Failed to save event');
      await fetchData(); // Refetch all data
      setShowEventDialog(false);
      setNewEvent({ title: '', date: '', type: 'reminder' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return;

    try {
      const response = await fetch(`${API_BASE}/api/events/${eventId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete event');
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="px-6 py-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              Welcome, {user?.name?.split(' ')[0] || 'Professor'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Create content · manage modules · track student progress
            </p>
          </div>
          <button className="btn-ghost text-xs flex items-center gap-1.5" onClick={fetchData} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-7">
          {[
            { icon: Users,        color: 'text-primary',    label: 'Total Students',  value: String(stats?.totalStudents ?? 0),                  sub: 'Registered' },
            { icon: BookOpen,     color: 'text-blue-500',   label: 'Active Modules',  value: String(stats?.activeModules ?? 0),                  sub: 'Your modules' },
            { icon: CheckCircle,  color: 'text-green-600',  label: 'Success Rate',    value: `${stats?.averageSuccessRate?.toFixed(1) ?? '0'}%`,  sub: 'Avg quiz score' },
            { icon: FileText,     color: 'text-orange-500', label: 'To Grade',        value: String(stats?.assignmentsToGrade ?? 0),             sub: 'Pending' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-border rounded px-4 py-4 shadow-xs">
              <div className="flex items-center gap-1.5 mb-2.5">
                <s.icon className={`h-3.5 w-3.5 ${s.color} shrink-0`} />
                <span className="text-[11.5px] text-muted-foreground font-medium uppercase tracking-wide">{s.label}</span>
              </div>
              {isLoading ? (
                <div className="skeleton h-7 w-14 rounded" />
              ) : (
                <div className="text-[1.8rem] font-bold text-foreground leading-none">{s.value}</div>
              )}
              <div className="text-[11.5px] text-muted-foreground mt-1">{s.sub}</div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="border-b border-border rounded-none p-0 bg-transparent h-auto gap-0">
            {['overview', 'calendar'].map(t => (
              <TabsTrigger key={t} value={t}
                className="capitalize px-4 py-2.5 text-[13px] font-medium rounded-none border-b-2 border-transparent
                  text-muted-foreground transition-all duration-150
                  data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:bg-transparent
                  hover:text-foreground">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-5">
            <div className="grid lg:grid-cols-7 gap-5">
              <div className="lg:col-span-4 bg-white border border-border rounded p-5 shadow-xs">
                <h3 className="text-[13.5px] font-semibold text-foreground mb-4">Module Success Rates</h3>
                {isLoading ? (
                  <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-8 bg-secondary animate-pulse rounded" />)}</div>
                ) : stats?.moduleSuccess.length ? (
                  <div className="space-y-3">
                    {stats.moduleSuccess.map(m => (
                      <div key={m.id_module}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-foreground font-medium truncate max-w-[70%]">{m.name}</span>
                          <span className="text-muted-foreground">{m.successRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={m.successRate} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No module data yet.</p>
                )}
              </div>
              <div className="lg:col-span-3 bg-white border border-border rounded p-5 shadow-xs">
                <h3 className="text-[13.5px] font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Create Module', href: '/module-wizard', icon: PlusCircle },
                    { label: 'Manage Modules', href: '/modules',      icon: BookOpen },
                    { label: 'Exams & Docs',  href: '/mode-exam',     icon: FileText },
                    { label: 'Numerical Lab', href: '/tools',         icon: Bell },
                  ].map(a => (
                    <button key={a.label}
                      onClick={() => { window.location.href = a.href; }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <a.icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Calendar */}
          <TabsContent value="calendar" className="space-y-4">
            <div className="bg-white border border-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-foreground">Calendar & Events</h3>
                <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                  <DialogTrigger asChild>
                    <button className="btn-primary text-xs" disabled={!user}>
                      <PlusCircle className="h-3.5 w-3.5" /> Add Event
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>New Calendar Event</DialogTitle>
                      <DialogDescription>Add an exam, assignment, or reminder.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="event-title" className="text-xs font-medium">Title</Label>
                        <Input id="event-title" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="e.g. Final Exam" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="event-date" className="text-xs font-medium">Date</Label>
                        <Input id="event-date" type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="event-type" className="text-xs font-medium">Type</Label>
                        <Select value={newEvent.type} onValueChange={(value: CalendarEvent['type']) => setNewEvent({ ...newEvent, type: value })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="exam">Exam</SelectItem>
                            <SelectItem value="assignment">Assignment</SelectItem>
                            <SelectItem value="reminder">Reminder</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <button className="btn-ghost text-xs" onClick={() => setShowEventDialog(false)}>Cancel</button>
                      <button className="btn-primary text-xs" onClick={handleSaveEvent}>Save</button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <Calendar mode="single" selected={date} onSelect={setDate} className="rounded border border-border" />
                <ScrollArea className="h-72">
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto mt-10" />
                  ) : events.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center mt-10">No events yet.</p>
                  ) : (
                    <div className="space-y-2 pr-2">
                      {events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(ev => (
                        <div key={ev.id} className="flex items-center gap-3 p-3 rounded border border-border bg-secondary">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{ev.title}</p>
                            <p className="text-xs text-muted-foreground">{new Date(ev.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${ev.type === 'exam' ? 'text-red-700 bg-red-50 border-red-200' : 'text-muted-foreground bg-white border-border'}`}>{ev.type}</span>
                          <button className="text-muted-foreground hover:text-destructive transition-colors" onClick={() => handleDeleteEvent(ev.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
