'use client';

import './globals.css';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="zh-CN">
      <head>
        <title>智盾校园 · AI 安全驾驶舱</title>
        <meta name="description" content="校园 AI 安全助手平台 — 智盾校园" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛡️</text></svg>" />
      </head>
      <body className="min-h-screen bg-cyber-dark mesh-bg">
        {mounted && <ParticleBackground />}
        <Navbar />
        <main className="relative z-10 pt-16 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
