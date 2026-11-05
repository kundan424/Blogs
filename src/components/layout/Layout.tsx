import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CommandPalette } from './CommandPalette';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-eggshell text-on-surface">
      <Navbar />
      <main className="flex-1 w-full pt-16">
        {children}
      </main>
      <Footer />
      <CommandPalette />
    </div>
  );
};
