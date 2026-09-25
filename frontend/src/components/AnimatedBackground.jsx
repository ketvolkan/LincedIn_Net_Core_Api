import React from 'react';
import logoImg from '../assets/logo.jpg';

const FLOATING_ITEMS = [
  { id: 1, type: 'emoji', content: '🥊', size: 'text-4xl sm:text-5xl', left: '6%', top: '12%', anim: 'animate-float-slow', delay: '0s' },
  { id: 2, type: 'logo', content: logoImg, size: 'w-10 h-10 sm:w-12 sm:h-12', left: '90%', top: '15%', anim: 'animate-float-reverse', delay: '1s' },
  { id: 3, type: 'emoji', content: '🔥', size: 'text-3xl sm:text-4xl', left: '18%', top: '48%', anim: 'animate-float-reverse', delay: '2s' },
  { id: 4, type: 'emoji', content: '💥', size: 'text-4xl sm:text-5xl', left: '82%', top: '42%', anim: 'animate-float-slow', delay: '1.5s' },
  { id: 5, type: 'emoji', content: '⚡', size: 'text-3xl sm:text-4xl', left: '8%', top: '78%', anim: 'animate-float-slow', delay: '0.5s' },
  { id: 6, type: 'emoji', content: '🥊', size: 'text-5xl sm:text-6xl', left: '88%', top: '80%', anim: 'animate-float-reverse', delay: '2.5s' },
  { id: 7, type: 'emoji', content: '🤬', size: 'text-3xl sm:text-4xl', left: '4%', top: '35%', anim: 'animate-float-slow', delay: '3s' },
  { id: 8, type: 'emoji', content: '💼', size: 'text-3xl sm:text-4xl', left: '94%', top: '60%', anim: 'animate-float-slow', delay: '1.8s' },
  { id: 9, type: 'logo', content: logoImg, size: 'w-9 h-9 sm:w-11 sm:h-11', left: '48%', top: '8%', anim: 'animate-float-reverse', delay: '0.8s' },
  { id: 10, type: 'emoji', content: '💀', size: 'text-3xl sm:text-4xl', left: '50%', top: '92%', anim: 'animate-float-slow', delay: '2.2s' },
  { id: 11, type: 'emoji', content: '🏢', size: 'text-3xl sm:text-4xl', left: '32%', top: '88%', anim: 'animate-float-reverse', delay: '1.2s' },
  { id: 12, type: 'emoji', content: '🥊', size: 'text-3xl sm:text-4xl', left: '68%', top: '86%', anim: 'animate-float-slow', delay: '0.3s' },
];

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10">
      {FLOATING_ITEMS.map((item) => (
        <div
          key={item.id}
          className={`absolute ${item.anim} opacity-[0.14] dark:opacity-[0.18] transition-transform`}
          style={{
            left: item.left,
            top: item.top,
            animationDelay: item.delay,
          }}
        >
          {item.type === 'logo' ? (
            <img
              src={item.content}
              alt="LinçedIn Logo"
              className={`${item.size} rounded-xl shadow-sm grayscale hover:grayscale-0 transition`}
            />
          ) : (
            <span className={item.size}>{item.content}</span>
          )}
        </div>
      ))}
    </div>
  );
}
