import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createGameHubConnection } from '../services/api';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Trophy, ArrowLeft, Send, Flame, Zap, Navigation, Award, AlertCircle } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

// Arena logical dimensions
const ARENA_WIDTH = 800;
const ARENA_HEIGHT = 680;
const BOSS_X = 400;
const BOSS_Y = 145;
const PUNCH_RANGE_Y = 295;
const PUNCH_RANGE_MIN_X = 250;
const PUNCH_RANGE_MAX_X = 550;
// Boss Burning Flames Effect (Emerges and intensifies as Boss HP drops)
function BossFlames({ hpPercent, isDefeated }) {
  if (isDefeated || hpPercent >= 75) return null;

  const isCritical = hpPercent <= 25;
  const isHeavy = hpPercent <= 50;

  return (
    <div className="absolute -inset-6 sm:-inset-8 pointer-events-none -z-10 flex items-center justify-center overflow-visible select-none">
      {/* Background Fiery Glow */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-700 blur-xl ${
          isCritical
            ? 'bg-red-600/50 animate-pulse scale-125'
            : isHeavy
            ? 'bg-orange-500/40 animate-pulse scale-110'
            : 'bg-amber-500/25 blur-lg scale-100'
        }`}
      />

      {/* SVG Layered Dancing Flames */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Left Flame Tongue */}
        <div className="absolute -left-3 bottom-2 w-10 sm:w-12 h-16 sm:h-20 animate-flameA origin-bottom">
          <svg viewBox="0 0 100 160" className="w-full h-full drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
            <path
              d="M50 0 C65 40 90 70 85 115 C80 145 55 160 50 160 C45 160 20 145 15 115 C10 70 35 40 50 0 Z"
              fill={isCritical ? '#dc2626' : '#ea580c'}
              opacity="0.85"
            />
            <path
              d="M50 30 C60 60 75 85 70 120 C66 142 54 152 50 152 C46 152 34 142 30 120 C25 85 40 60 50 30 Z"
              fill="#f59e0b"
            />
            <path
              d="M50 70 C55 90 65 105 62 130 C60 144 53 148 50 148 C47 148 40 144 38 130 C35 105 45 90 50 70 Z"
              fill="#fef08a"
            />
          </svg>
        </div>

        {/* Center Back Flame (Taller) */}
        <div className={`absolute -top-6 w-14 sm:w-16 ${isCritical ? 'h-24 sm:h-28' : 'h-18 sm:h-22'} animate-flameB origin-bottom`}>
          <svg viewBox="0 0 100 160" className="w-full h-full drop-shadow-[0_0_12px_rgba(249,115,22,0.9)]">
            <path
              d="M50 0 C70 45 95 80 90 125 C85 155 58 160 50 160 C42 160 15 155 10 125 C5 80 30 45 50 0 Z"
              fill={isCritical ? '#b91c1c' : '#f97316'}
              opacity="0.9"
            />
            <path
              d="M50 25 C62 55 80 85 75 125 C70 148 56 155 50 155 C44 155 30 148 25 125 C20 85 38 55 50 25 Z"
              fill="#fbbf24"
            />
            <path
              d="M50 65 C57 85 68 105 64 135 C61 148 54 152 50 152 C46 152 39 148 36 135 C32 105 43 85 50 65 Z"
              fill="#fffbeb"
            />
          </svg>
        </div>

        {/* Right Flame Tongue */}
        <div className="absolute -right-3 bottom-2 w-10 sm:w-12 h-16 sm:h-20 animate-flameA origin-bottom" style={{ animationDelay: '0.2s' }}>
          <svg viewBox="0 0 100 160" className="w-full h-full drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
            <path
              d="M50 0 C65 40 90 70 85 115 C80 145 55 160 50 160 C45 160 20 145 15 115 C10 70 35 40 50 0 Z"
              fill={isCritical ? '#dc2626' : '#ea580c'}
              opacity="0.85"
            />
            <path
              d="M50 30 C60 60 75 85 70 120 C66 142 54 152 50 152 C46 152 34 142 30 120 C25 85 40 60 50 30 Z"
              fill="#f59e0b"
            />
            <path
              d="M50 70 C55 90 65 105 62 130 C60 144 53 148 50 148 C47 148 40 144 38 130 C35 105 45 90 50 70 Z"
              fill="#fef08a"
            />
          </svg>
        </div>

        {/* Extra Side Flame Tongues for Heavy / Critical HP */}
        {(isHeavy || isCritical) && (
          <>
            <div className="absolute -left-6 top-3 w-8 h-14 animate-flameB origin-bottom" style={{ animationDelay: '0.35s' }}>
              <svg viewBox="0 0 100 160" className="w-full h-full drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]">
                <path d="M50 0 C65 40 85 70 80 115 C75 145 55 160 50 160 C45 160 25 145 20 115 C15 70 35 40 50 0 Z" fill="#ef4444" />
                <path d="M50 35 C60 60 72 85 68 120 C65 140 53 150 50 150 C47 150 35 140 32 120 C28 85 40 60 50 35 Z" fill="#fb923c" />
              </svg>
            </div>
            <div className="absolute -right-6 top-3 w-8 h-14 animate-flameB origin-bottom" style={{ animationDelay: '0.15s' }}>
              <svg viewBox="0 0 100 160" className="w-full h-full drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]">
                <path d="M50 0 C65 40 85 70 80 115 C75 145 55 160 50 160 C45 160 25 145 20 115 C15 70 35 40 50 0 Z" fill="#ef4444" />
                <path d="M50 35 C60 60 72 85 68 120 C65 140 53 150 50 150 C47 150 35 140 32 120 C28 85 40 60 50 35 Z" fill="#fb923c" />
              </svg>
            </div>
          </>
        )}

        {/* Rising Burning Sparks / Embers */}
        {isHeavy && (
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute left-1/4 bottom-4 w-1.5 h-1.5 rounded-full bg-amber-300 animate-ember-1 shadow-[0_0_6px_#fde047]"></span>
            <span className="absolute right-1/4 bottom-6 w-2 h-2 rounded-full bg-orange-400 animate-ember-2 shadow-[0_0_6px_#fb923c]"></span>
            <span className="absolute left-1/3 bottom-8 w-1.5 h-1.5 rounded-full bg-red-400 animate-ember-3 shadow-[0_0_6px_#f87171]"></span>
            {isCritical && (
              <>
                <span className="absolute right-1/3 bottom-5 w-2 h-2 rounded-full bg-yellow-300 animate-ember-4 shadow-[0_0_8px_#fef08a]"></span>
                <span className="absolute left-1/2 bottom-3 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ember-1 shadow-[0_0_8px_#f59e0b]"></span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 2D Player Character Figure with Gender (Male / Female Hair Styles)
function CharacterFigure({
  facing = 'up',
  isWalking = false,
  hasPunch = false,
  color = '#3B82F6',
  gender = 'male',
  isLocal = false
}) {
  const isFemale = gender === 'female';
  const sizeMultiplier = isLocal ? 'scale-110' : 'scale-100';

  return (
    <div className={`relative flex flex-col items-center transition-transform ${sizeMultiplier} ${isWalking ? 'animate-bounce' : ''}`}>
      {/* Head (Kafa) */}
      <div className="w-8 h-8 rounded-full bg-amber-200 border-2 border-slate-900 relative shadow-md flex items-center justify-center">
        {/* Hair Styles based on Gender */}
        {isFemale ? (
          <>
            {/* Female Hair: Bangs */}
            <div className="absolute -top-0.5 inset-x-0 h-3 bg-slate-900 rounded-t-full z-10"></div>
            {/* Female Hair: Left Long Locks */}
            <div className="absolute -left-1.5 top-2 w-2.5 h-7 bg-slate-900 rounded-b-xl z-10 shadow-sm"></div>
            {/* Female Hair: Right Long Locks */}
            <div className="absolute -right-1.5 top-2 w-2.5 h-7 bg-slate-900 rounded-b-xl z-10 shadow-sm"></div>
            {/* Female Hair: Top Ponytail Bun */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-3 bg-slate-900 rounded-t-full"></div>
            {/* Soft pink cheeks */}
            <div className="absolute bottom-1.5 left-1 w-1.5 h-1 bg-pink-400/70 rounded-full z-10"></div>
            <div className="absolute bottom-1.5 right-1 w-1.5 h-1 bg-pink-400/70 rounded-full z-10"></div>
          </>
        ) : (
          <>
            {/* Male Hair: Short Top */}
            <div className="absolute top-0 inset-x-0 h-2.5 bg-slate-900 rounded-t-full"></div>
          </>
        )}

        {/* Eyes following direction */}
        <div className={`flex gap-1.5 transition-transform z-10 ${
          facing === 'left' ? '-translate-x-1.5' :
          facing === 'right' ? 'translate-x-1.5' :
          facing === 'up' ? '-translate-y-1' : 'translate-y-0.5'
        }`}>
          <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
        </div>
      </div>

      {/* Torso / Body (Vücut) */}
      <div
        className="w-6 h-5 rounded-b-md border border-slate-900 -mt-1 shadow-sm relative flex items-center justify-center z-10"
        style={{ backgroundColor: color }}
      >
        <div className="w-2 h-1.5 bg-white/40 rounded-full"></div>
      </div>

      {/* Little Legs / Feet */}
      <div className="flex gap-1.5 -mt-0.5 z-10">
        <div className={`w-2 h-2 bg-slate-900 rounded-sm transition-transform ${isWalking ? 'translate-y-0.5' : ''}`}></div>
        <div className={`w-2 h-2 bg-slate-900 rounded-sm transition-transform ${isWalking ? '-translate-y-0.5' : ''}`}></div>
      </div>

      {/* Left Boxing Glove */}
      <div
        className={`absolute top-4 -left-2.5 w-3 h-3 rounded-full bg-red-600 border border-white shadow-md transition-all duration-150 z-20 ${
          hasPunch && facing === 'left' ? '-translate-x-4 scale-150' : ''
        }`}
      ></div>

      {/* Right Boxing Glove */}
      <div
        className={`absolute top-4 -right-2.5 w-3 h-3 rounded-full bg-red-600 border border-white shadow-md transition-all duration-150 z-20 ${
          hasPunch && facing !== 'left' ? 'translate-x-4 scale-150' : ''
        }`}
      ></div>

      {/* Floor Shadow */}
      <div className="w-7 h-1.5 bg-black/30 rounded-full blur-[0.5px] -mt-0.5"></div>
    </div>
  );
}

export default function GameArena({ room, playerName, playerGender = 'male', onLeaveRoom }) {
  // Boss State
  const [bossHp, setBossHp] = useState(room.boss?.currentHp ?? 50000);
  const [maxHp, setMaxHp] = useState(room.boss?.maxHp ?? 50000);
  const [isDefeated, setIsDefeated] = useState(room.boss?.isDefeated ?? false);
  const [bossQuote, setBossQuote] = useState('Agree?');
  const [isBossHit, setIsBossHit] = useState(false);

  // Local Player State
  const [myPos, setMyPos] = useState({ x: 400, y: 500 });
  const [myFacing, setMyFacing] = useState('up');
  const [isWalking, setIsWalking] = useState(false);
  const [isPunching, setIsPunching] = useState(false);
  const [inRange, setInRange] = useState(false);
  const [punchFeedback, setPunchFeedback] = useState('');

  // Multiplayer State
  const [players, setPlayers] = useState({});
  const [punchingPlayers, setPunchingPlayers] = useState({}); // connId -> timestamp

  // UI & Stats
  const [floaters, setFloaters] = useState([]);
  const [combo, setCombo] = useState(0);
  const [topPunchers, setTopPunchers] = useState(room.topPunchers || []);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const connectionRef = useRef(null);
  const keysRef = useRef({});
  const posRef = useRef({ x: 400, y: 500 });
  const facingRef = useRef('up');
  const targetPosRef = useRef(null);
  const lastNetworkSendRef = useRef(0);
  const comboTimerRef = useRef(null);

  // Setup SignalR Hub
  useEffect(() => {
    const connection = createGameHubConnection();
    connectionRef.current = connection;

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
    const myColor = colors[Math.floor(Math.random() * colors.length)];

    connection.start()
      .then(async () => {
        await connection.invoke('JoinRoom', room.roomCode, playerName, myColor, playerGender);
      })
      .catch((err) => console.error('SignalR Hub Connection Error:', err));

    connection.on('ExistingPlayers', (existingList) => {
      const map = {};
      existingList.forEach(p => {
        map[p.connectionId] = p;
      });
      setPlayers(map);
    });

    connection.on('PlayerJoined', (newPlayer) => {
      setPlayers(prev => ({ ...prev, [newPlayer.connectionId]: newPlayer }));
      addNotification(`${newPlayer.playerName} linç meydanına adım attı!`);
    });

    connection.on('PlayerLeft', (connId) => {
      setPlayers(prev => {
        const copy = { ...prev };
        delete copy[connId];
        return copy;
      });
    });

    connection.on('PlayerMoved', ({ connectionId, x, y, facing }) => {
      setPlayers(prev => {
        if (!prev[connectionId]) return prev;
        return {
          ...prev,
          [connectionId]: { ...prev[connectionId], x, y, facing }
        };
      });
    });

    connection.on('BossDamaged', (data) => {
      setBossHp(data.newHp);
      setMaxHp(data.maxHp);
      setIsBossHit(true);
      setTimeout(() => setIsBossHit(false), 200);

      if (data.randomQuote) setBossQuote(data.randomQuote);
      if (data.topPunchers) setTopPunchers(data.topPunchers);

      // Trigger punch animation on the attacker's avatar
      if (data.puncherId) {
        setPunchingPlayers(prev => ({ ...prev, [data.puncherId]: Date.now() }));
        setTimeout(() => {
          setPunchingPlayers(prev => {
            const next = { ...prev };
            delete next[data.puncherId];
            return next;
          });
        }, 250);
      }

      // Add comic floater damage
      addFloater(data.damage, data.isCrit, data.puncherName);

      if (data.isDefeated && !isDefeated) {
        setIsDefeated(true);
        sounds.playVictory();
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      }
    });

    connection.on('ChatMessageReceived', (msg) => {
      setChatMessages(prev => [...prev.slice(-30), msg]);
    });

    return () => {
      if (connection) connection.stop();
    };
  }, [room.roomCode]);

  // Smooth Game Loop (60 FPS Keyboard & Click Movement)
  useEffect(() => {
    let animId;

    const gameLoop = () => {
      const keys = keysRef.current;
      const speed = 4.2;
      let dx = 0;
      let dy = 0;

      // Keyboard input
      if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
      if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
      if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

      // Click-to-move target interpolation
      if (targetPosRef.current && dx === 0 && dy === 0) {
        const target = targetPosRef.current;
        const diffX = target.x - posRef.current.x;
        const diffY = target.y - posRef.current.y;
        const dist = Math.hypot(diffX, diffY);

        if (dist > 5) {
          dx = (diffX / dist);
          dy = (diffY / dist);
        } else {
          targetPosRef.current = null;
        }
      }

      let newX = posRef.current.x;
      let newY = posRef.current.y;
      let moved = false;

      if (dx !== 0 || dy !== 0) {
        // Normalize diagonal speed
        if (dx !== 0 && dy !== 0) {
          dx *= 0.7071;
          dy *= 0.7071;
        }

        newX = Math.max(35, Math.min(ARENA_WIDTH - 35, newX + dx * speed));
        // minY is 225 so players cannot walk inside/behind the boss podium, but can stand right in front of it
        newY = Math.max(225, Math.min(ARENA_HEIGHT - 40, newY + dy * speed));

        // Determine facing direction
        let facing = facingRef.current;
        if (Math.abs(dx) > Math.abs(dy)) {
          facing = dx > 0 ? 'right' : 'left';
        } else if (dy !== 0) {
          facing = dy > 0 ? 'down' : 'up';
        }

        posRef.current = { x: newX, y: newY };
        facingRef.current = facing;
        setMyPos({ x: newX, y: newY });
        setMyFacing(facing);
        moved = true;
      }

      setIsWalking(moved);

      // Check proximity to Boss (Boss is at x: 400, y: 90)
      const closeEnough = newY <= PUNCH_RANGE_Y && newX >= PUNCH_RANGE_MIN_X && newX <= PUNCH_RANGE_MAX_X;
      setInRange(closeEnough);

      // Broadcast position to SignalR server throttled to 20 times/second
      const now = performance.now();
      if (moved && now - lastNetworkSendRef.current > 50) {
        lastNetworkSendRef.current = now;
        if (connectionRef.current && connectionRef.current.state === 'Connected') {
          connectionRef.current.invoke('Move', room.roomCode, newX, newY, facingRef.current).catch(() => {});
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [room.roomCode]);

  // Key Down & Up Event Handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;

      if (['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        if (e.code === 'Space') {
          e.preventDefault();
          executePunch();
          return;
        }
        keysRef.current[e.code] = true;
        targetPosRef.current = null; // Clear click target on manual key press
      }
    };

    const handleKeyUp = (e) => {
      if (keysRef.current[e.code]) {
        keysRef.current[e.code] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [inRange, isDefeated]);

  // Handle Arena Touch / Click (Walk to spot or punch)
  const handleArenaInput = (clientX, clientY, currentTarget) => {
    const rect = currentTarget.getBoundingClientRect();
    const scaleX = ARENA_WIDTH / rect.width;
    const scaleY = ARENA_HEIGHT / rect.height;
    const clickX = (clientX - rect.left) * scaleX;
    const clickY = (clientY - rect.top) * scaleY;

    // If clicking on Boss or right in front of Boss, and within range, punch!
    if (clickY < 250 && Math.abs(clickX - BOSS_X) < 130) {
      executePunch();
      return;
    }

    targetPosRef.current = { x: clickX, y: Math.max(225, clickY) };
  };

  const handleArenaClick = (e) => {
    handleArenaInput(e.clientX, e.clientY, e.currentTarget);
  };

  const handleArenaTouch = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    handleArenaInput(touch.clientX, touch.clientY, e.currentTarget);
  };

  const executePunch = () => {
    if (isDefeated) return;

    // Visual swing
    setIsPunching(true);
    setTimeout(() => setIsPunching(false), 200);

    // Range Check
    if (!inRange) {
      sounds.playPunch(false);
      setPunchFeedback('⚠️ Menzil dışısın! Boss’un yanına yürü!');
      setTimeout(() => setPunchFeedback(''), 1500);
      return;
    }

    setPunchFeedback('');
    setCombo(prev => prev + 1);
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => setCombo(0), 2000);

    sounds.playPunch(combo % 5 === 0);

    if (connectionRef.current && connectionRef.current.state === 'Connected') {
      connectionRef.current.invoke('PunchBoss', room.roomCode, room.id, 35).catch(() => {});
    }
  };

  const addFloater = (damage, isCrit, puncher) => {
    const id = Math.random();
    const x = BOSS_X + (Math.random() * 80 - 40);
    const y = BOSS_Y + 50 + (Math.random() * 30 - 15);
    setFloaters(prev => [...prev, { id, damage, isCrit, puncher, x, y }]);
    setTimeout(() => {
      setFloaters(prev => prev.filter(f => f.id !== id));
    }, 1000);
  };

  const addNotification = (text) => {
    setChatMessages(prev => [...prev.slice(-30), { playerName: 'SİSTEM', message: text, time: '' }]);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !connectionRef.current) return;
    connectionRef.current.invoke('SendChatMessage', room.roomCode, chatInput.trim()).catch(() => {});
    setChatInput('');
  };

  const hpPercent = Math.max(0, Math.min(100, Math.round((bossHp / maxHp) * 100)));

  return (
    <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
      {/* Top Navbar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onLeaveRoom}
            className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ayrıl</span>
          </button>
          <div>
            <h1 className="text-base font-black text-white flex items-center gap-2">
              <span>{room.title}</span>
              <span className="bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs px-2 py-0.5 rounded-lg">
                #{room.roomCode}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {combo > 1 && (
            <div className="flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-xl font-black text-xs animate-punchPop">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{combo}x COMBO!</span>
            </div>
          )}
          <div className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-xl border border-slate-700">
            Aktif Linççiler: <strong className="text-white">{Object.keys(players).length + 1}</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: 2D Interactive Arena + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* 2D PLAYFIELD (Col 8) */}
        <div className="lg:col-span-8 flex flex-col items-center">
          
          {/* Proximity / Instructions Banner */}
          <div className="w-full flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl text-xs font-bold transition-all duration-300 bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-300 hidden sm:inline">
                Kontrol: <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400">W, A, S, D</kbd> veya <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400">Yön Tuşları</kbd> ile yürü.
              </span>
              <span className="text-slate-300 sm:hidden">
                Ekrana dokunarak veya tuşlarla yürü!
              </span>
            </div>

            {inRange ? (
              <span className="text-emerald-400 font-extrabold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 animate-pulse">
                🔥 MENZİLDESİN! BOŞLUK VEYA TIKLA!
              </span>
            ) : (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Boss'un yanına yaklaş! (Menzil dışı)
              </span>
            )}
          </div>

          {/* 2D ARENA STAGE (SVG / Canvas Overlay Field) */}
          <div
            onClick={handleArenaClick}
            onTouchStart={handleArenaTouch}
            className="w-full relative bg-slate-950 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl select-none cursor-crosshair touch-none h-[490px] sm:h-auto sm:aspect-[800/680]"
          >
            {/* Floor Texture / Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

            {/* 1. TOP SECTION: THE ELEVATED BOSS STAGE */}
            <div className="absolute top-0 left-0 right-0 h-56 bg-gradient-to-b from-blue-950/70 via-slate-900/90 to-transparent border-b border-blue-900/40 pointer-events-none">
              <div className="text-center pt-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400/80 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-800/40">
                  🏢 LinkedIn Executive Kürsüsü & Linç Sahnesi
                </span>
              </div>
            </div>

            {/* Marked Punch Zone Area Indicator */}
            <div
              className={`absolute border-2 border-dashed rounded-3xl transition-all duration-300 pointer-events-none ${
                inRange ? 'border-amber-400/70 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'border-blue-500/20 bg-blue-500/5'
              }`}
              style={{
                left: `${(PUNCH_RANGE_MIN_X / ARENA_WIDTH) * 100}%`,
                top: `${(215 / ARENA_HEIGHT) * 100}%`,
                width: `${((PUNCH_RANGE_MAX_X - PUNCH_RANGE_MIN_X) / ARENA_WIDTH) * 100}%`,
                height: `${(85 / ARENA_HEIGHT) * 100}%`
              }}
            >
              <div className="text-center mt-1 text-[10px] font-black text-slate-400/80">
                {inRange ? '🥊 VURUŞ ALANINDASIN!' : '🎯 YUMRUK MENZİLİ'}
              </div>
            </div>

            {/* BOSS CHARACTER ON STAGE */}
            <div
              className="absolute flex flex-col items-center pointer-events-none"
              style={{
                left: `${(BOSS_X / ARENA_WIDTH) * 100}%`,
                top: `${(BOSS_Y / ARENA_HEIGHT) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Comic Speech Bubble */}
              <div className="relative mb-2 bg-white text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-2xl shadow-2xl border-2 border-blue-600 animate-bounce max-w-[220px] text-center">
                <span>"{bossQuote}"</span>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-blue-600"></div>
              </div>

              {/* Boss Avatar & Platform */}
              <div className="relative">
                {/* FLAMES AROUND BOSS AS HP DROPS */}
                <BossFlames hpPercent={hpPercent} isDefeated={isDefeated} />

                {/* HIT REACTION CONTAINER (No parent translate displacement) */}
                <div className={`relative transition-transform duration-100 ${isBossHit ? 'animate-bossHit' : ''}`}>
                  {/* Expanding Shockwave Impact Ring when hit */}
                  {isBossHit && (
                    <div className="absolute -inset-3 sm:-inset-4 rounded-full border-4 border-amber-400 animate-ping pointer-events-none z-20 opacity-80"></div>
                  )}

                  {/* Impact Comic Sparks 💥 */}
                  {isBossHit && (
                    <div className="absolute -top-3 -right-2 text-2xl select-none pointer-events-none z-30 drop-shadow-[0_0_12px_rgba(251,191,36,1)] animate-punchPop">
                      💥
                    </div>
                  )}

                  <div
                    className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 p-1 bg-slate-900 shadow-2xl transition-all duration-200 relative overflow-hidden ${
                      isBossHit
                        ? 'border-red-500 shadow-red-500/80 ring-4 ring-red-500/50'
                        : hpPercent <= 25
                        ? 'border-red-500 shadow-red-500/60 ring-2 ring-red-500/30'
                        : hpPercent <= 50
                        ? 'border-orange-500 shadow-orange-500/50'
                        : 'border-blue-500 shadow-blue-500/50'
                    }`}
                  >
                    <img
                      src={room.boss?.avatarUrl || logoImg}
                      alt={room.boss?.fullName}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className={`w-full h-full rounded-full object-cover transition-all ${
                        isDefeated ? 'grayscale rotate-90' : ''
                      } ${isBossHit ? 'brightness-125 saturate-150' : ''}`}
                    />
                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white font-black text-xs w-6 h-6 rounded-lg flex items-center justify-center border-2 border-white z-10">
                      in
                    </div>

                    {/* Red Flash Overlay on Hit */}
                    {isBossHit && (
                      <div className="absolute inset-0 rounded-full bg-red-600/35 mix-blend-overlay pointer-events-none z-10"></div>
                    )}
                  </div>
                </div>

                {isDefeated && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white whitespace-nowrap z-20">
                    ☠️ DEVRİLDİ!
                  </div>
                )}
              </div>

              {/* Boss Name, Linç Sebebi & Dynamic HP Bar */}
              <div className="mt-1.5 text-center w-60">
                <div className="font-extrabold text-xs text-white truncate drop-shadow">
                  {room.boss?.fullName}
                </div>

                {/* Linç Sebebi Badge */}
                <div className="my-1 px-2.5 py-0.5 bg-amber-500/15 border border-amber-500/30 rounded-lg text-[10px] text-amber-300 font-semibold line-clamp-1 max-w-[240px] mx-auto shadow-sm">
                  ⚡ {room.description || 'Toplanın linçliyoruz!'}
                </div>

                {/* HP BAR - Dynamic Multi-Stage Colors (Yeşil -> Sarı -> Turuncu -> Kırmızı) */}
                <div className="h-3 w-full bg-slate-950 rounded-full border border-slate-700 p-0.5 overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      hpPercent > 65
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                        : hpPercent > 40
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                        : hpPercent > 20
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600'
                        : 'bg-gradient-to-r from-red-600 to-red-500 animate-pulse'
                    }`}
                    style={{ width: `${hpPercent}%` }}
                  ></div>
                </div>
                <div className="text-[9px] font-mono font-bold text-slate-300 mt-0.5">
                  {bossHp} / {maxHp} HP ({hpPercent}%)
                </div>
              </div>
            </div>

            {/* FLOATING DAMAGE POPUPS */}
            {floaters.map(f => (
              <div
                key={f.id}
                className={`absolute font-black pointer-events-none transition-all duration-700 animate-punchPop z-30 ${
                  f.isCrit ? 'text-amber-300 text-lg drop-shadow-[0_2px_10px_rgba(245,158,11,0.9)]' : 'text-red-400 text-sm'
                }`}
                style={{
                  left: `${(f.x / ARENA_WIDTH) * 100}%`,
                  top: `${(f.y / ARENA_HEIGHT) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {f.isCrit ? `💥 -${f.damage} CRIT!` : `🥊 -${f.damage}`}
                <span className="block text-[9px] text-white/80">{f.puncher}</span>
              </div>
            ))}

            {/* 2. OTHER MULTIPLAYER PLAYERS */}
            {Object.values(players).map(p => {
              const hasPunch = Boolean(punchingPlayers[p.connectionId]);
              return (
                <div
                  key={p.connectionId}
                  className="absolute pointer-events-none transition-all duration-100 ease-linear flex flex-col items-center z-10"
                  style={{
                    left: `${(p.x / ARENA_WIDTH) * 100}%`,
                    top: `${(p.y / ARENA_HEIGHT) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {/* Floating Name Tag above head */}
                  <div className="mb-1 bg-slate-900/90 text-slate-200 border border-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                    {p.playerName}
                  </div>

                  {/* Character Figure (Kadın / Erkek Seçimine Göre) */}
                  <CharacterFigure
                    facing={p.facing}
                    isWalking={false}
                    hasPunch={hasPunch}
                    color={p.avatarColor || '#3B82F6'}
                    gender={p.gender || 'male'}
                    isLocal={false}
                  />
                </div>
              );
            })}

            {/* 3. LOCAL PLAYER (SEN) */}
            <div
              className="absolute pointer-events-none flex flex-col items-center z-20"
              style={{
                left: `${(myPos.x / ARENA_WIDTH) * 100}%`,
                top: `${(myPos.y / ARENA_HEIGHT) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Floating Name Tag above MY head */}
              <div className="mb-1 bg-blue-600 text-white border border-blue-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xl shadow-blue-500/40 flex items-center gap-1 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping"></span>
                <span>{playerName} (Sen)</span>
              </div>

              {/* Local Character Figure (Kadın / Erkek Seçimine Göre) */}
              <CharacterFigure
                facing={myFacing}
                isWalking={isWalking}
                hasPunch={isPunching}
                color="#2563EB"
                gender={playerGender}
                isLocal={true}
              />
            </div>

            {/* Punch Feedback Banner (e.g. Too far away) */}
            {punchFeedback && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-600/90 text-white font-black text-xs px-4 py-2 rounded-xl shadow-2xl border border-white animate-bounce pointer-events-none z-40">
                {punchFeedback}
              </div>
            )}
          </div>

          {/* Action Trigger Button (Bottom of Arena - Desktop) */}
          <div className="w-full mt-3 hidden sm:block">
            <button
              onClick={executePunch}
              disabled={isDefeated}
              className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all transform active:scale-95 shadow-xl flex items-center justify-center gap-2 ${
                isDefeated
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : inRange
                  ? 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white shadow-red-600/40 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <span className="text-xl">🥊</span>
              <span>
                {isDefeated
                  ? 'BOSS DEVİRİLDİ!'
                  : inRange
                  ? 'MENZİLDESİN! YUMRUK AT (BOŞLUK / TIK)'
                  : "BOSS'A YAKLAŞ! (MENZİL DIŞI)"}
              </span>
            </button>
          </div>

          {/* Mobile Controller Console (D-Pad + Big Thumb Punch Button) */}
          <div className="w-full flex items-center justify-between gap-3 mt-3 sm:hidden select-none">
            {/* Virtual Directional D-Pad */}
            <div className="grid grid-cols-3 gap-1.5 w-36 h-28 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
              <div></div>
              <button
                type="button"
                onTouchStart={(e) => { e.preventDefault(); keysRef.current['KeyW'] = true; targetPosRef.current = null; }}
                onTouchEnd={(e) => { e.preventDefault(); keysRef.current['KeyW'] = false; }}
                onMouseDown={() => { keysRef.current['KeyW'] = true; targetPosRef.current = null; }}
                onMouseUp={() => { keysRef.current['KeyW'] = false; }}
                className="bg-slate-800 active:bg-blue-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-md border border-slate-700 active:scale-90 transition-transform"
              >
                ▲
              </button>
              <div></div>
              <button
                type="button"
                onTouchStart={(e) => { e.preventDefault(); keysRef.current['KeyA'] = true; targetPosRef.current = null; }}
                onTouchEnd={(e) => { e.preventDefault(); keysRef.current['KeyA'] = false; }}
                onMouseDown={() => { keysRef.current['KeyA'] = true; targetPosRef.current = null; }}
                onMouseUp={() => { keysRef.current['KeyA'] = false; }}
                className="bg-slate-800 active:bg-blue-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-md border border-slate-700 active:scale-90 transition-transform"
              >
                ◀
              </button>
              <button
                type="button"
                onTouchStart={(e) => { e.preventDefault(); keysRef.current['KeyS'] = true; targetPosRef.current = null; }}
                onTouchEnd={(e) => { e.preventDefault(); keysRef.current['KeyS'] = false; }}
                onMouseDown={() => { keysRef.current['KeyS'] = true; targetPosRef.current = null; }}
                onMouseUp={() => { keysRef.current['KeyS'] = false; }}
                className="bg-slate-800 active:bg-blue-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-md border border-slate-700 active:scale-90 transition-transform"
              >
                ▼
              </button>
              <button
                type="button"
                onTouchStart={(e) => { e.preventDefault(); keysRef.current['KeyD'] = true; targetPosRef.current = null; }}
                onTouchEnd={(e) => { e.preventDefault(); keysRef.current['KeyD'] = false; }}
                onMouseDown={() => { keysRef.current['KeyD'] = true; targetPosRef.current = null; }}
                onMouseUp={() => { keysRef.current['KeyD'] = false; }}
                className="bg-slate-800 active:bg-blue-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-md border border-slate-700 active:scale-90 transition-transform"
              >
                ▶
              </button>
            </div>

            {/* Mobile Thumb Action Button */}
            <div className="flex-1 h-28">
              <button
                type="button"
                onTouchStart={(e) => { e.preventDefault(); executePunch(); }}
                onClick={executePunch}
                disabled={isDefeated}
                className={`w-full h-full rounded-2xl font-black text-sm uppercase tracking-wider transition-all transform active:scale-95 shadow-xl flex flex-col items-center justify-center gap-1 ${
                  isDefeated
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : inRange
                    ? 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 text-white shadow-red-600/40 animate-pulse border-2 border-amber-300'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                <span className="text-3xl">🥊</span>
                <span className="text-xs">
                  {isDefeated ? 'BİTTİ' : inRange ? 'YUMRUK AT!' : 'YAKLAŞ'}
                </span>
                {combo > 1 && (
                  <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded-full text-amber-300 font-extrabold">
                    {combo}x COMBO
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* SIDEBAR: MVP LEADERBOARD & CHAT (Col 4) */}
        <div className="lg:col-span-4 space-y-3 flex flex-col">
          
          {/* MVP / LEADERBOARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
            <div className="flex items-center gap-2 mb-3 text-amber-400 font-black text-xs uppercase tracking-wider">
              <Trophy className="w-4 h-4 fill-amber-400" />
              <span>En Çok Linçleyenler (MVP)</span>
            </div>

            <div className="space-y-1.5">
              {topPunchers.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Henüz vuran yok. İlk yumruğu sen at!</p>
              ) : (
                topPunchers.map((tp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] ${
                        idx === 0 ? 'bg-amber-400 text-slate-950' :
                        idx === 1 ? 'bg-slate-300 text-slate-950' :
                        idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="font-bold text-white truncate max-w-[110px]">{tp.playerName}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-red-400">{tp.totalDamage} HP</span>
                      <span className="text-[9px] text-slate-500 block">{tp.punchCount} vuruş</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CHAT & QUICK TAUNTS */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex-1 flex flex-col min-h-[220px]">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>Oda Sohbeti</span>
            </h3>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 max-h-40 pr-1 text-xs">
              {chatMessages.length === 0 ? (
                <p className="text-slate-500 text-center py-4 text-xs">Odadakilerle sohbet et veya laf sok!</p>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80">
                    <span className="font-bold text-blue-400 mr-1">{msg.playerName}:</span>
                    <span className="text-slate-200">{msg.message}</span>
                  </div>
                ))
              )}
            </div>

            {/* Quick Taunt Buttons */}
            <div className="flex gap-1 py-2 overflow-x-auto text-[10px]">
              {['Agree mi şimdi?!', 'Sinerjine başlatma!', 'Growth mindset!', 'CV’me bak hele!'].map((quick, qIdx) => (
                <button
                  key={qIdx}
                  type="button"
                  onClick={() => {
                    if (connectionRef.current) {
                      connectionRef.current.invoke('SendChatMessage', room.roomCode, quick).catch(() => {});
                    }
                  }}
                  className="whitespace-nowrap px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold border border-slate-700"
                >
                  {quick}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="flex gap-1.5 pt-1">
              <input
                type="text"
                maxLength={100}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Bir şeyler yaz..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-xl transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
