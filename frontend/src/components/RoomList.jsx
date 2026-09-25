import React from 'react';
import { Users, Skull, Search, ArrowRight, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export default function RoomList({
  rooms = [],
  totalCount = 0,
  pageNumber = 1,
  totalPages = 1,
  hasPreviousPage = false,
  hasNextPage = false,
  searchTerm = '',
  onSearchChange,
  onPageChange,
  isLoading = false,
  onJoinRoom,
  onOpenCreateModal
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* FILTER & STATS BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Linç Odaları</span>
            <span className="text-xs bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-semibold px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-slate-700">
              {totalCount} Oda
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bir odaya katıl veya sağ üstteki butondan yeni hedef belirle.
          </p>
        </div>

        {/* Search Bar - Clean Blue Theme */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Oda başlığı veya Boss ara..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {isLoading && (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
          )}
        </div>
      </div>

      {/* ROOMS GRID - MATTE PASTEL BLUE CARDS */}
      {rooms.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {searchTerm ? `"${searchTerm}" aramasına uygun oda bulunamadı` : 'Henüz oda bulunamadı'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchTerm
              ? 'Farklı bir isim aramayı dene veya yeni bir linç odası başlat.'
              : 'İlk linç odasını sen aç! Bir LinkedIn profil linki girerek Boss\'u meydana çıkar.'}
          </p>
          {searchTerm ? (
            <button
              onClick={() => onSearchChange('')}
              className="mt-2 inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-3.5 py-1.5 rounded-lg transition"
            >
              <span>Aramayı Temizle</span>
            </button>
          ) : (
            <button
              onClick={onOpenCreateModal}
              className="mt-2 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow-sm"
            >
              <span>Oda Başlat</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rooms.map((r) => {
            const boss = r.boss;
            const currentHp = boss?.currentHp ?? 50000;
            const maxHp = boss?.maxHp ?? 50000;
            const hpPercent = Math.max(0, Math.min(100, Math.round((currentHp / maxHp) * 100)));
            const isDefeated = boss?.isDefeated || currentHp <= 0;

            return (
              <div
                key={r.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-800/80 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Code & Defeated status */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-semibold bg-blue-50 dark:bg-slate-950 text-blue-700 dark:text-blue-400 px-2.5 py-0.5 rounded-md border border-blue-100 dark:border-slate-800">
                      #{r.roomCode}
                    </span>
                    {isDefeated ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                        <Skull className="w-3.5 h-3.5" />
                        DEVRİLDİ
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 px-2.5 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
                        CANLI LİNÇ
                      </span>
                    )}
                  </div>

                  {/* Boss Avatar & Info */}
                  <div className="flex items-center gap-3.5 mb-4.5">
                    <div className="relative shrink-0">
                      <img
                        src={boss?.avatarUrl || logoImg}
                        alt={boss?.fullName}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className={`w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 ${
                          isDefeated ? 'grayscale' : ''
                        }`}
                      />
                      <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded flex items-center justify-center border border-white">
                        in
                      </div>
                    </div>

                    <div className="overflow-hidden">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {boss?.fullName}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        Linç Hedefi
                      </span>
                    </div>
                  </div>

                  {/* Room Title & Linç Sebebi */}
                  <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 mb-4.5 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0"></span>
                      <span>{r.title}</span>
                    </h4>
                    <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg p-2.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1 mb-0.5">
                        ⚡ Linç Sebebi
                      </span>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed font-medium">
                        {r.description || 'Toplanın linçliyoruz!'}
                      </p>
                    </div>
                  </div>

                  {/* Boss HP Bar - Dynamic Stage Colors (Yeşil -> Sarı -> Turuncu -> Kırmızı) */}
                  <div className="space-y-1.5 mb-5">
                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                      <span>Boss Canı</span>
                      <span className="font-mono text-slate-900 dark:text-white font-semibold">{currentHp} / {maxHp} HP</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-950 rounded-full border border-slate-200 dark:border-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          hpPercent > 65
                            ? 'bg-emerald-500 dark:bg-emerald-400'
                            : hpPercent > 40
                            ? 'bg-amber-500 dark:bg-amber-400'
                            : hpPercent > 20
                            ? 'bg-orange-500 dark:bg-orange-400'
                            : 'bg-red-500 dark:bg-red-400 animate-pulse'
                        }`}
                        style={{ width: `${hpPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Join Button */}
                <button
                  onClick={() => onJoinRoom(r)}
                  className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 ${
                    isDefeated
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm active:scale-98'
                  }`}
                >
                  <span>{isDefeated ? 'Skorları Gör' : 'Odaya Dal'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sayfa <strong className="text-slate-900 dark:text-white">{pageNumber}</strong> / {totalPages} (Toplam {totalCount} Oda)
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(pageNumber - 1)}
              disabled={!hasPreviousPage || isLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Önceki</span>
            </button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                if (p === 1 || p === totalPages || Math.abs(p - pageNumber) <= 1) {
                  return (
                    <button
                      key={p}
                      onClick={() => onPageChange(p)}
                      disabled={isLoading}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                        p === pageNumber
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  );
                }
                if (p === 2 && pageNumber > 3) return <span key={p} className="text-slate-400 px-0.5">...</span>;
                if (p === totalPages - 1 && pageNumber < totalPages - 2) return <span key={p} className="text-slate-400 px-0.5">...</span>;
                return null;
              })}
            </div>

            <button
              onClick={() => onPageChange(pageNumber + 1)}
              disabled={!hasNextPage || isLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              <span>Sonraki</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
