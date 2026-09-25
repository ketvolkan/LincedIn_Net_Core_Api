import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import RoomList from './components/RoomList';
import GameArena from './components/GameArena';
import CreateRoomModal from './components/CreateRoomModal';
import NicknameModal from './components/NicknameModal';
import AnimatedBackground from './components/AnimatedBackground';
import AdminPanel from './components/AdminPanel';
import { api } from './services/api';

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    return window.location.pathname.startsWith('/admin') || window.location.hash === '#/admin';
  });

  useEffect(() => {
    const checkRoute = () => {
      setIsAdminRoute(window.location.pathname.startsWith('/admin') || window.location.hash === '#/admin');
    };
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
  };

  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setIsAdminRoute(true);
  };
  const [pagedData, setPagedData] = useState({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 6,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeRoom, setActiveRoom] = useState(null);
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('lincedin_player_name') || '';
  });
  const [playerGender, setPlayerGender] = useState(() => {
    return localStorage.getItem('lincedin_player_gender') || 'male';
  });

  // Dark / Light Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [pendingRoomToJoin, setPendingRoomToJoin] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const searchDebounceRef = useRef(null);

  // Fetch Rooms from Backend with Search & Pagination
  const fetchRooms = useCallback(async (search = searchTerm, page = currentPage) => {
    setIsLoading(true);
    try {
      const data = await api.getActiveRooms(search, page, 6);
      if (data && Array.isArray(data.items)) {
        setPagedData(data);
      }
    } catch (err) {
      console.error('Odalar yüklenirken hata:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, currentPage]);

  // Initial load & Polling when not in active game
  useEffect(() => {
    if (!activeRoom) {
      fetchRooms(searchTerm, currentPage);
      const interval = setInterval(() => {
        fetchRooms(searchTerm, currentPage);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [activeRoom, searchTerm, currentPage, fetchRooms]);

  // Handle Search Input with 350ms debounce
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      fetchRooms(term, 1);
    }, 350);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchRooms(searchTerm, newPage);
  };

  const handleRoomCreated = (newRoom) => {
    fetchRooms('', 1);
    if (!playerName) {
      setPendingRoomToJoin(newRoom);
      setIsNicknameModalOpen(true);
    } else {
      setActiveRoom(newRoom);
    }
  };

  const handleJoinRoom = (room) => {
    if (!playerName) {
      setPendingRoomToJoin(room);
      setIsNicknameModalOpen(true);
    } else {
      setActiveRoom(room);
    }
  };

  const handleConfirmNickname = (name, gender = 'male') => {
    setPlayerName(name);
    setPlayerGender(gender);
    localStorage.setItem('lincedin_player_name', name);
    localStorage.setItem('lincedin_player_gender', gender);
    setIsNicknameModalOpen(false);
    if (pendingRoomToJoin) {
      setActiveRoom(pendingRoomToJoin);
      setPendingRoomToJoin(null);
    }
  };

  const handleLeaveRoom = () => {
    setActiveRoom(null);
    fetchRooms(searchTerm, currentPage);
  };

  if (isAdminRoute) {
    return <AdminPanel onNavigateHome={navigateToHome} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200 relative overflow-x-hidden">
      {/* Dynamic Animated Ambient Emoji & Logo Background */}
      <AnimatedBackground />

      <div>
        <Header
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          activeRoomCount={pagedData.totalCount}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />

        <main>
          {activeRoom ? (
            <GameArena
              room={activeRoom}
              playerName={playerName || 'Anonim Linççi'}
              playerGender={playerGender}
              onLeaveRoom={handleLeaveRoom}
            />
          ) : (
            <RoomList
              rooms={pagedData.items}
              totalCount={pagedData.totalCount}
              pageNumber={pagedData.pageNumber}
              totalPages={pagedData.totalPages}
              hasPreviousPage={pagedData.hasPreviousPage}
              hasNextPage={pagedData.hasNextPage}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onPageChange={handlePageChange}
              isLoading={isLoading}
              onJoinRoom={handleJoinRoom}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Floating Action Button (FAB) - Linç Başlat */}
      {!activeRoom && (
        <div className="fixed bottom-6 right-6 z-40 group">
          {/* Ambient Glow Pulse */}
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="relative flex items-center gap-3 px-5 py-3.5 sm:px-6 sm:py-4 rounded-full bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:to-orange-500 text-white font-black shadow-2xl shadow-red-500/50 hover:shadow-orange-500/70 transform active:scale-95 hover:-translate-y-1 transition-all duration-200 border-2 border-white/30"
          >
            <span className="text-2xl sm:text-3xl animate-bounce">🥊</span>
            <div className="text-left">
              <span className="block text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-yellow-200 leading-none">
                YENİ HEDEF
              </span>
              <span className="text-sm sm:text-base font-extrabold tracking-wide drop-shadow whitespace-nowrap">
                Linç Başlat
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-5 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>LinçedIn &copy; {new Date().getFullYear()} — Mizah amaçlı yapılmış 2D çok oyunculu tarayıcı oyunudur. Herhangi bir şirketi temsil etmez.</p>
          <button
            onClick={navigateToAdmin}
            className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold transition hover:underline shrink-0"
          >
            🔐 Yönetici Paneli
          </button>
        </div>
      </footer>

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRoomCreated={handleRoomCreated}
      />

      <NicknameModal
        isOpen={isNicknameModalOpen}
        onClose={() => setIsNicknameModalOpen(false)}
        onConfirm={handleConfirmNickname}
        currentName={playerName}
        currentGender={playerGender}
      />
    </div>
  );
}
