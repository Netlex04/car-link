import { ReactNode } from 'react';
import { Navigation } from './navigation';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background dark">
      <Navigation />
      <main className="pt-16 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
}
