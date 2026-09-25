import React from 'react';
import { Plus, Sun, Moon, Users } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export default function Header({
  onOpenCreateModal,
  activeRoomCount = 0,
  isDarkMode = true,
  onToggleTheme
}) {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Brand & Requested Header Text */}
        <div className="flex items-center gap-3.5">
          <img 
            src={logoImg} 
            alt="LinçedIn Logo" 
            className="w-12 h-12 rounded-xl object-cover shadow-sm border border-blue-200 dark:border-blue-900/50 shrink-0"
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center">
                Linç<span className="text-blue-600 dark:text-blue-400">ed</span>
                <span className="bg-blue-600 text-white px-1.5 py-0.2 rounded-md text-sm ml-0.5">In</span>
              </span>
              <h1 className="text-xs sm:text-sm font-extrabold text-blue-700 dark:text-blue-400 pl-1 border-l border-slate-300 dark:border-slate-700">
                LinkedIn'de Canını Sıkan Birini Linçle!
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-snug">
              Sürekli <em>"Bugün bir mülakatta..."</em> diye başlayan, <em>"Agree?"</em> diye soran, motivasyon kasan herkesi Boss yapıyoruz. Arkadaşlarınla odaya girip birlikte yumruklayın!
            </p>
          </div>
        </div>

        {/* Right Actions: Theme Toggle, Room Count & Linçle Button */}
        <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
          {/* Active room count pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Aktif Odalar: <strong className="text-blue-700 dark:text-white">{activeRoomCount}</strong></span>
          </div>

          {/* Dark / Light Mode Switch */}
          <button
            onClick={onToggleTheme}
            title={isDarkMode ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
