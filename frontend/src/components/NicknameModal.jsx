import React, { useState } from 'react';
import { User, Sparkles, X } from 'lucide-react';

export default function NicknameModal({ isOpen, onClose, onConfirm, currentName, currentGender = 'male' }) {
  const [name, setName] = useState(currentName || '');
  const [gender, setGender] = useState(currentGender || 'male');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onConfirm(name.trim(), gender);
  };

  const handleRandomize = () => {
    const prefixes = ['B2B_Avcısı', 'SinerjiBükücü', 'AgreeDüşmanı', 'GrowthLinççisi', 'CV_Yırtan', 'PromptMaster', 'AntiSynergy', 'ToplantıSavarı'];
    const random = prefixes[Math.floor(Math.random() * prefixes.length)] + '_' + Math.floor(100 + Math.random() * 900);
    setName(random);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-2.5">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Karakterini ve Adını Seç</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Arenada arkadaşların seni bu karakter ve isimle görecek.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Karakter Cinsiyet / Tip Seçimi */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider text-center">
              Karakter Tipi
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition ${
                  gender === 'male'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <span className="text-lg">👦</span>
                <span className="text-xs">Erkek</span>
              </button>

              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition ${
                  gender === 'female'
                    ? 'border-pink-600 bg-pink-50 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300 font-bold ring-2 ring-pink-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <span className="text-lg">👧</span>
                <span className="text-xs">Kadın (Uzun Saç)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
              Takma Adın *
            </label>
            <input
              type="text"
              required
              autoFocus
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: SinerjiBükücü"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 text-center font-bold shadow-inner"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRandomize}
              className="flex-1 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Rastgele İsim</span>
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition"
            >
              Meydana Gir!
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
