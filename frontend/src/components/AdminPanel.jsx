import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import logoImg from '../assets/logo.jpg';
import {
  ShieldAlert,
  LogOut,
  ArrowLeft,
  Trash2,
  Search,
  RefreshCw,
  Skull,
  Flame,
  Layers,
  Award,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export default function AdminPanel({ onNavigateHome }) {
  const [token, setToken] = useState(() => localStorage.getItem('lincedin_admin_token') || '');
  const [adminUser, setAdminUser] = useState(() => localStorage.getItem('lincedin_admin_user') || '');

  // Login Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');

  const turnstileContainerRef = useRef(null);
  const turnstileWidgetIdRef = useRef(null);

  const TURNSTILE_SITE_KEY = '0x4AAAAAAFDeeiN3WSqSu-7w';

  // Load Cloudflare Turnstile script & render widget on login screen
  useEffect(() => {
    if (token) return; // Not needed if already logged in

    const scriptId = 'cloudflare-turnstile-script';
    let script = document.getElementById(scriptId);

    const renderWidget = () => {
      if (window.turnstile && turnstileContainerRef.current && !turnstileWidgetIdRef.current) {
        try {
          turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
            sitekey: TURNSTILE_SITE_KEY,
            theme: 'dark',
            callback: (t) => {
              setCaptchaToken(t);
              setLoginError('');
            },
            'expired-callback': () => {
              setCaptchaToken('');
            },
            'error-callback': () => {
              setCaptchaToken('');
            }
          });
        } catch (err) {
          console.error('Turnstile render error:', err);
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      script.onload = () => {
        renderWidget();
      };
    } else if (window.turnstile) {
      renderWidget();
    }

    return () => {
      if (window.turnstile && turnstileWidgetIdRef.current) {
        try {
          window.turnstile.remove(turnstileWidgetIdRef.current);
        } catch {}
        turnstileWidgetIdRef.current = null;
      }
    };
  }, [token]);

  // Dashboard Data State
  const [stats, setStats] = useState({ totalRooms: 0, activeRooms: 0, defeatedBosses: 0, totalPunches: 0 });
  const [rooms, setRooms] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const searchTimerRef = useRef(null);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    if (!captchaToken) {
      setLoginError('Lütfen güvenlik doğrulamasını (Captcha) tamamlayın.');
      return;
    }

    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await api.adminLogin(username.trim(), password, captchaToken);
      if (res && res.token) {
        setToken(res.token);
        setAdminUser(res.username);
        localStorage.setItem('lincedin_admin_token', res.token);
        localStorage.setItem('lincedin_admin_user', res.username);
      }
    } catch (err) {
      setLoginError(err.message || 'Giriş yapılamadı.');
      // Reset Turnstile on error
      if (window.turnstile && turnstileWidgetIdRef.current) {
        try {
          window.turnstile.reset(turnstileWidgetIdRef.current);
        } catch {}
      }
      setCaptchaToken('');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setToken('');
    setAdminUser('');
    localStorage.removeItem('lincedin_admin_token');
    localStorage.removeItem('lincedin_admin_user');
  };

  // Fetch Dashboard Stats
  const loadStats = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.getAdminStats(token);
      if (data) setStats(data);
    } catch (err) {
      if (err.message.includes('Yetkisiz')) handleLogout();
    }
  }, [token]);

  // Fetch Rooms
  const loadRooms = useCallback(async (search = searchTerm, pageNum = page) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await api.getAdminRooms(token, search, pageNum, pageSize);
      if (data) {
        setRooms(data.items || []);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      if (err.message.includes('Yetkisiz')) handleLogout();
    } finally {
      setIsLoading(false);
    }
  }, [token, searchTerm, page, pageSize]);

  useEffect(() => {
    if (token) {
      loadStats();
      loadRooms(searchTerm, page);
    }
  }, [token, loadStats, loadRooms, page]);

  // Search Debounce
  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setPage(1);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      loadRooms(val, 1);
    }, 350);
  };

  // Delete Room
  const confirmDelete = async () => {
    if (!roomToDelete || !token) return;
    setIsDeleting(true);
    try {
      await api.deleteAdminRoom(token, roomToDelete.id);
      setActionMessage(`'${roomToDelete.title}' odası başarıyla silindi.`);
      setTimeout(() => setActionMessage(''), 4000);
      setRoomToDelete(null);
      loadRooms(searchTerm, page);
      loadStats();
    } catch (err) {
      alert('Oda silinirken hata: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // ----------------------------------------------------
  // 1. LOGIN SCREEN (If not authenticated)
  // ----------------------------------------------------
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-7 shadow-2xl relative overflow-hidden">
          {/* Top Line Accent */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-blue-600"></div>

          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-blue-950/60 border border-blue-900 text-blue-400 mb-3">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-white">LinçedIn Yönetim Paneli</h1>
            <p className="text-xs text-slate-400 mt-1">Lütfen yetkili yönetici bilgilerinizle giriş yapın.</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-400 font-semibold animate-shake">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Yönetici Kullanıcı Adı</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Kullanıcı Adı"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 pl-10"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Şifre</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 pl-10 pr-10"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Cloudflare Turnstile Captcha Widget */}
            <div className="flex justify-center my-3 min-h-[65px]">
              <div ref={turnstileContainerRef}></div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn || !username || !password || !captchaToken}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-lg transition active:scale-98 text-sm flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Doğrulanıyor...</span>
                </>
              ) : (
                <span>Giriş Yap</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <button
              onClick={onNavigateHome}
              className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ana Sayfaya Dön</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. DASHBOARD SCREEN (When authenticated)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Admin Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="LinçedIn" className="w-9 h-9 rounded-lg object-cover" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-white">LinçedIn</span>
                <span className="bg-red-600/30 text-red-400 border border-red-500/40 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Yönetim Paneli
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Giriş yapan: <strong>{adminUser}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Siteye Dön</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-white bg-red-950/60 hover:bg-red-900/80 border border-red-900/50 px-3 py-1.5 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full space-y-6">
        {/* Action feedback toast */}
        {actionMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* 4 Metric / Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
            <div className="p-3 rounded-xl bg-blue-950/60 text-blue-400 border border-blue-900">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Toplam Oda</span>
              <span className="text-xl font-black text-white">{stats.totalRooms}</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
            <div className="p-3 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-900">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Aktif Linç Odası</span>
              <span className="text-xl font-black text-amber-400">{stats.activeRooms}</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
            <div className="p-3 rounded-xl bg-red-950/60 text-red-400 border border-red-900">
              <Skull className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Devrilen Boss</span>
              <span className="text-xl font-black text-red-400">{stats.defeatedBosses}</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
            <div className="p-3 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-900">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Toplam Yumruk</span>
              <span className="text-xl font-black text-emerald-400">{stats.totalPunches.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Room Management Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Linç Odaları Yönetimi</h2>
              <p className="text-xs text-slate-400">Veritabanındaki tüm odaları listeleyin, inceleyin veya silin.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Oda veya Boss ara..."
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 pl-8 w-52"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>

              <button
                onClick={() => { loadRooms(); loadStats(); }}
                title="Yenile"
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Oda Kodu</th>
                  <th className="py-3 px-4">Boss Adı</th>
                  <th className="py-3 px-4">Linç Sebebi</th>
                  <th className="py-3 px-4">Can (HP)</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4">Yumruk</th>
                  <th className="py-3 px-4">Tarih</th>
                  <th className="py-3 px-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {rooms.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-slate-500">
                      {isLoading ? 'Odalar yükleniyor...' : 'Hiç oda bulunamadı.'}
                    </td>
                  </tr>
                ) : (
                  rooms.map((r) => {
                    const boss = r.boss;
                    const maxHp = boss?.maxHp || 50000;
                    const currentHp = boss?.currentHp || 0;
                    const percent = Math.max(0, Math.min(100, Math.round((currentHp / maxHp) * 100)));
                    const isDefeated = boss?.isDefeated || currentHp <= 0;

                    return (
                      <tr key={r.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                          #{r.roomCode}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={boss?.avatarUrl || logoImg}
                              alt={boss?.fullName}
                              className="w-7 h-7 rounded-lg object-cover bg-slate-950 border border-slate-700"
                            />
                            <span className="font-bold text-slate-200 truncate max-w-[120px]">{boss?.fullName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400 max-w-[180px] truncate" title={r.description}>
                          {r.description || r.title}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="w-24">
                            <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                              <span>{currentHp}</span>
                              <span>%{percent}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  percent > 65 ? 'bg-emerald-500' : percent > 40 ? 'bg-amber-400' : percent > 20 ? 'bg-orange-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {isDefeated ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                              DEVRİLDİ
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              CANLI
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                          🥊 {r.totalPunches || 0}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setRoomToDelete(r)}
                            className="p-1.5 bg-red-950/60 hover:bg-red-900 border border-red-900/50 text-red-400 hover:text-white rounded-lg transition"
                            title="Odayı Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 text-xs">
              <span className="text-slate-400">
                Toplam <strong>{totalCount}</strong> odadan <strong>{(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalCount)}</strong> arası
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg transition"
                >
                  Önceki
                </button>
                <span className="px-2 text-slate-400 font-mono">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg transition"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {roomToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-900/60 text-red-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">Odayı Silmek İstiyor musunuz?</h3>
            <p className="text-xs text-slate-400 mb-4">
              <strong>"{roomToDelete.title}"</strong> odası ve tüm yumruk logları kalıcı olarak silinecektir. Bu işlem geri alınamaz.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRoomToDelete(null)}
                className="flex-1 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Evet, Sil</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        LinçedIn Admin &copy; {new Date().getFullYear()} — Yetkili Yönetim Konsolu
      </footer>
    </div>
  );
}
