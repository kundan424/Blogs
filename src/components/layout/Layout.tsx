import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CommandPalette } from './CommandPalette';
import { ReadingProgressBar } from '../interactive/ReadingProgressBar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-body-ink antialiased">
      <ReadingProgressBar />
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
      <CommandPalette />
    </div>
  );
};
