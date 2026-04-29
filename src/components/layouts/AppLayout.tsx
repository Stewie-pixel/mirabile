import type { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
