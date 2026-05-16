'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/', label: '🏠 驾驶舱', icon: '🛡️' },
  { href: '/content-detect', label: '内容检测', icon: '🔍' },
  { href: '/prompt-filter', label: '提示词过滤', icon: '🛡️' },
  { href: '/fraud-detect', label: '诈骗识别', icon: '🚨' },
  { href: '/deepfake', label: '深度伪造', icon: '🎭' },
  { href: '/security-chat', label: '安全助手', icon: '💬' },
  { href: '/study-assistant', label: '学习助手', icon: '📚' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-t-0 border-x-0">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-cyan-500/20">
            🛡️
          </div>
          <div>
            <h1 className="text-lg font-bold text-white glow-text">智盾校园</h1>
            <p className="text-xs text-cyan-400/60">AI 安全驾驶舱</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === item.href
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Status indicator */}
        <div className="hidden md:flex items-center gap-3">
          <span className="status-dot online" />
          <span className="text-xs text-gray-400">系统运行中</span>
          <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            DEMO v1.0
          </span>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden text-gray-400 hover:text-white p-2"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden glass-card rounded-none border-x-0 border-b-0 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm transition-all ${
                  pathname === item.href
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
