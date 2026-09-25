import React, { useState } from 'react';
import { X, Plus, Loader2, Link, RefreshCw, Check } from 'lucide-react';
import { api } from '../services/api';
import logoImg from '../assets/logo.jpg';

const PRESET_AVATARS = [
  { id: 'ceo', name: 'Plaza CEO', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CEO_Ahmet&clothing=blazerAndShirt' },
  { id: 'leader', name: 'Thought Leader', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leadership&glasses=round' },
  { id: 'synergy', name: 'Sinerji Gurusu', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SynergyMan&hair=shortHairShortFlat' },
  { id: 'influencer', name: 'Influencer', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZehraInfluencer&hair=longHairBob' },
  { id: 'founder', name: 'Startup Kurucusu', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=StartupFounder&facialHair=beardLight' },
  { id: 'prompt', name: 'Prompt Mimarı', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PromptMaster&glasses=prescription02' },
];

export default function CreateRoomModal({ isOpen, onClose, onRoomCreated }) {
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0].url);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxHp, setMaxHp] = useState(50000);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleNameChange = (e) => {
    const val = e.target.value;
    setFullName(val);
    if (!title || title.endsWith('Linçleme Odası') || title.endsWith('Lincleme Odası')) {
      setTitle(val.trim() ? `${val.trim()} Lincleme Odası` : '');
    }
  };

  const handleRandomAvatar = () => {
    const randomSeed = 'RandomBoss_' + Math.floor(Math.random() * 10000);
    setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !title.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await api.createRoom({
        title,
        description: description || 'Toplanın linçliyoruz!',
        linkedInUrl: '',
        fullName: fullName.trim(),
        headline: '',
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
        maxHp: Number(maxHp)
      });

      if (response && response.data) {
        onRoomCreated(response.data);
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert('Oda oluşturulurken hata oluştu: ' + (err.message || 'Sunucuya ulaşılamadı.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Clean Single Blue Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Yeni Linç Odası Aç</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Linçlenecek kişinin adını gir ve görselini belirle.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Kişinin Adı & Soyadı */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Linçlenecek Kişinin Adı Soyadı *
            </label>
            <input
              type="text"
              required
              autoFocus
              maxLength={50}
              value={fullName}
              onChange={handleNameChange}
              placeholder="Örn: Ahmet Yılmaz"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner font-semibold"
            />
          </div>

          {/* GÖRSEL SEÇİMİ (URL veya Hazır Avatar) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Boss Görseli (Görsel URL'si veya Avatar Seç)
              </label>
              <button
                type="button"
                onClick={handleRandomAvatar}
                className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 transition"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Rastgele Avatar</span>
              </button>
            </div>

            {/* Preview Box & URL Input */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/70 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="relative shrink-0">
                <img
                  src={avatarUrl || logoImg}
                  alt="Seçilen Görsel"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = logoImg;
                  }}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-blue-500 bg-white dark:bg-slate-900 shadow-sm"
                />
                <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded flex items-center justify-center">
                  in
                </div>
              </div>

              <div className="flex-1 space-y-1">
                <div className="relative">
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/resim.jpg"
                    maxLength={300}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner pl-8 font-mono"
                  />
                  <Link className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  İnternetteki herhangi bir fotoğraf bağlantısını yapıştırabilir veya aşağıdan avatar seçebilirsiniz.
                </span>
              </div>
            </div>

            {/* Hazır Avatarlar Listesi */}
            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">veya hazır bir boss avatarı seç:</span>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_AVATARS.map((p) => {
                  const isSelected = avatarUrl === p.url;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      title={p.name}
                      onClick={() => setAvatarUrl(p.url)}
                      className={`relative p-1 rounded-xl border-2 transition-all flex flex-col items-center group ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 shadow-sm scale-105'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <img
                        src={p.url}
                        alt={p.name}
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Oda Başlığı */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Oda Başlığı *
            </label>
            <input
              type="text"
              required
              maxLength={80}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Sürekli 'Agree?' yazan Ahmet'e Yumruk Odası"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
            />
          </div>

          {/* Linç Sebebi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <span className="text-amber-500">⚡</span>
              <span>Linç Sebebi (Neden Linçliyoruz?) *</span>
            </label>
            <input
              type="text"
              required
              maxLength={200}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Örn: Sürekli 'Agree?' yazıp akıl vermesi / Gece 23:00'te toplantı koyması"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
            />
          </div>

          {/* Boss Canı (HP Zorluğu) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Boss Canı (HP)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Kolay (30.000 HP)', val: 30000 },
                { label: 'Normal (50.000 HP)', val: 50000 },
                { label: 'Zorlu (100.000 HP)', val: 100000 },
              ].map((tier) => (
                <button
                  key={tier.val}
                  type="button"
                  onClick={() => setMaxHp(tier.val)}
                  className={`py-1.5 text-xs font-semibold rounded-xl border transition ${
                    maxHp === tier.val
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !fullName.trim() || !title.trim()}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Oda Başlatılıyor...</span>
                </>
              ) : (
                <span>Linç Odasını Başlat</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
