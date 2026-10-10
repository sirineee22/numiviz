/**
 * AppSidebar — authenticated LMS navigation.
 * Student view vs Professor view.
 * Shown only on authenticated routes (not public pages).
 */
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileDialog } from '@/components/UserProfileDialog';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Calculator, LayoutDashboard, BookOpen, FlaskConical, History,
  FileText, Target, LogOut, LogIn, Users, Brain, PlusCircle, BarChart3,
} from 'lucide-react';

// ─── Nav items per role ────────────────────────────────────────────────────────
// Student: Learn + Practice + Track
const STUDENT_NAV = [
  { title: 'My Learning',   url: '/modules',   icon: BookOpen },
  { title: 'Numerical Lab', url: '/tools',     icon: FlaskConical },
  { title: 'Practice',      url: '/practice',  icon: Target },
  { title: 'Exam Mode',     url: '/mode-exam', icon: FileText },
];

// Professor: Create + Manage + Analyze
const PROFESSOR_NAV = [
  { title: 'My Modules',    url: '/modules',          icon: BookOpen },
  { title: 'Create Module', url: '/module-wizard',    icon: PlusCircle },
  { title: 'Numerical Lab', url: '/tools',            icon: FlaskConical },
  { title: 'Exams & Docs',  url: '/mode-exam',        icon: FileText },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const isProfessor = user?.role === 'professeur';
  const navItems = isProfessor ? PROFESSOR_NAV : STUDENT_NAV;

  return (
    <Sidebar className="border-r border-border bg-white w-56 animate-slide-in" style={{ animationFillMode: 'forwards' }}>
      {/* Brand */}
      <SidebarHeader className="px-4 py-3.5 border-b border-border">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 w-full group"
        >
          <div className="h-6 w-6 rounded bg-primary flex items-center justify-center shrink-0 group-hover:bg-primary/90 transition-colors"
          >
            <Calculator className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-[14px] font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
            NumiViz
          </span>
          {isProfessor && (
            <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded
              bg-primary/[8%] text-primary border border-primary/20">
              Prof
            </span>
          )}
        </button>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {isAuthenticated ? (
          <>
            {/* User info */}
            <div className="mx-1 mb-4 px-2.5 py-2 rounded border border-border bg-secondary/50">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/15
                  flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-foreground truncate leading-tight">
                    {user?.name?.split(' ')[0]}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{isProfessor ? 'Professor' : 'Student'}</div>
                </div>
              </div>
            </div>

            {/* Nav */}
            {/* Dashboard shortcut */}
            <button
              onClick={() => navigate(isProfessor ? '/professor-dashboard' : '/dashboard')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded mb-2 text-[13px] transition-all duration-150 ${
                (location.pathname === '/dashboard' || location.pathname === '/professor-dashboard')
                  ? 'bg-primary/[8%] text-primary font-medium'
                  : 'text-foreground/65 hover:bg-secondary hover:text-foreground'
              }`}
            >
              <LayoutDashboard className={`h-3.5 w-3.5 shrink-0 ${
                (location.pathname === '/dashboard' || location.pathname === '/professor-dashboard')
                  ? 'text-primary' : 'text-muted-foreground'
              }`} />
              Dashboard
            </button>

            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/80 px-2 mb-0.5">
                {isProfessor ? 'Create & Manage' : 'Learn & Practice'}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0">
                  {navItems.map(item => {
                    const isActive = location.pathname === item.url ||
                      (item.url !== '/' && location.pathname.startsWith(item.url));
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={`h-8 rounded transition-all duration-150 ${
                            isActive
                              ? 'bg-primary/[8%] text-primary font-medium'
                              : 'text-foreground/65 hover:bg-secondary hover:text-foreground'
                          }`}
                        >
                          <button
                            onClick={() => navigate(item.url)}
                            className="w-full flex items-center gap-2.5 px-2.5"
                          >
                            <item.icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="text-[13px]">{item.title}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : (
          /* Unauthenticated prompt */
          <div className="flex flex-col items-center text-center px-3 py-10 gap-3">
            <div className="h-9 w-9 rounded-full bg-secondary border border-border flex items-center justify-center">
              <LogIn className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-foreground mb-0.5">Sign in to continue</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Access your dashboard and learning modules.</p>
            </div>
            <button
              onClick={() => navigate('/auth')}
              className="w-full h-8 rounded bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="w-full h-8 rounded border border-border text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors"
            >
              Create account
            </button>
          </div>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-2 py-2.5 border-t border-border space-y-0.5">
        {isAuthenticated && user && (
          <SidebarMenuItem className="list-none">
            <UserProfileDialog />
          </SidebarMenuItem>
        )}
        {isAuthenticated && (
          <SidebarMenuItem className="list-none">
            <SidebarMenuButton asChild className="h-8 rounded transition-all duration-150 text-muted-foreground/70 hover:text-destructive hover:bg-red-50">
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="w-full flex items-center gap-2.5 px-2.5"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[13px]">Log out</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
