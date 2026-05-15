import type { ReactNode } from 'react';
import { useLocation } from 'react-router';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

const SIDEBAR_ROUTES = ['/dashboard', '/generator', '/progress', '/profile', '/instructions', '/chat', '/roadmap'];

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const isSidebarRoute = SIDEBAR_ROUTES.some(
    p => location.pathname === p || location.pathname.startsWith(p + '/')
  );

  if (isSidebarRoute) {
    return (
      <div className="flex min-h-screen w-full flex-col" style={{ background: '#080D12' }}>
        <Navbar />
        <div className="flex flex-1 min-h-0">
          <Sidebar />
          <main className="flex-1 min-w-0 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}