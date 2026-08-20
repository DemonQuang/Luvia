import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMusic } from '../../store/music.store';

interface FloatingMusicPlayerProps {
  music?: string;
  isDark?: boolean;
}

export const FloatingMusicPlayer: React.FC<FloatingMusicPlayerProps> = ({ music, isDark = false }) => {
  const { isPlaying, progress: audioProgress, togglePlay, playMusic, pauseMusic, currentMusic } = useMusic();
  const [musicExpanded, setMusicExpanded] = useState(false);

  // Position state for dragging
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef<{ clientX: number; clientY: number; posX: number; posY: number }>({ clientX: 0, clientY: 0, posX: 0, posY: 0 });
  const hasMovedRef = useRef(false);
  const playerRef = useRef<HTMLDivElement>(null);

  // Set default initial position at bottom-left on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && position === null) {
      const defaultY = window.innerHeight - 80;
      const defaultX = 20;
      setPosition({ x: defaultX, y: defaultY });
    }
  }, [position]);

  // Adjust position on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => {
        if (!prev) return null;
        const maxX = window.innerWidth - 70;
        const maxY = window.innerHeight - 70;
        return {
          x: Math.min(Math.max(15, prev.x), maxX),
          y: Math.min(Math.max(70, prev.y), maxY),
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Music auto play/pause management
  useEffect(() => {
    if (music) {
      if (music !== currentMusic) {
        playMusic(music);
      }
    } else {
      pauseMusic();
    }

    return () => {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/page/')) {
        pauseMusic();
      }
    };
  }, [music, currentMusic, playMusic, pauseMusic]);

  // Handle Drag Start
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag with primary mouse button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    
    // Don't drag if clicking buttons inside expanded player
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    isDraggingRef.current = true;
    hasMovedRef.current = false;
    
    const currentX = position ? position.x : 20;
    const currentY = position ? position.y : (window.innerHeight - 80);

    dragStartPosRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      posX: currentX,
      posY: currentY,
    };

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Handle Pointer Move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - dragStartPosRef.current.clientX;
    const deltaY = e.clientY - dragStartPosRef.current.clientY;

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasMovedRef.current = true;
    }

    if (hasMovedRef.current) {
      const newX = dragStartPosRef.current.posX + deltaX;
      const newY = dragStartPosRef.current.posY + deltaY;

      const playerWidth = playerRef.current ? playerRef.current.offsetWidth : 60;
      const playerHeight = playerRef.current ? playerRef.current.offsetHeight : 60;

      const clampedX = Math.min(Math.max(10, newX), window.innerWidth - playerWidth - 10);
      const clampedY = Math.min(Math.max(65, newY), window.innerHeight - playerHeight - 10);

      setPosition({ x: clampedX, y: clampedY });
    }
  };

  // Handle Pointer Up
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const handleNoteClick = useCallback(() => {
    if (hasMovedRef.current) return; // Ignore click if user was dragging
    setMusicExpanded(prev => !prev);
    if (!isPlaying && music) {
      playMusic(music);
    }
  }, [isPlaying, music, playMusic]);

  const handlePlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlay();
  }, [togglePlay]);

  if (!music) return null;

  const styleObj: React.CSSProperties = position
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: 'fixed',
        touchAction: 'none',
      }
    : {
        bottom: '24px',
        left: '20px',
        position: 'fixed',
        touchAction: 'none',
      };

  return (
    <div
      ref={playerRef}
      style={styleObj}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="z-50 select-none animate-fade-in pointer-events-auto cursor-grab active:cursor-grabbing"
    >
      {/* Collapsed Button: Draggable anywhere on screen */}
      {!musicExpanded && (
        <button
          type="button"
          onClick={handleNoteClick}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 relative overflow-hidden shadow-[0_6px_25px_rgba(0,0,0,0.3)] cursor-pointer ${
            isDark
              ? 'bg-[#180020]/85 hover:bg-[#250032] border border-pink-400/40 text-pink-300 backdrop-blur-md'
              : 'bg-white/90 hover:bg-white border border-pink-200/80 text-primary backdrop-blur-md'
          }`}
          title={isPlaying ? 'Nhạc đang phát (Kéo để di chuyển, bấm để mở rộng)' : 'Bấm để phát nhạc (Kéo để di chuyển)'}
        >
          {/* Subtle spinning glow when playing */}
          <div
            className={`absolute inset-0 rounded-full transition-opacity duration-500 ${
              isPlaying
                ? isDark
                  ? 'bg-pink-500/25 animate-spin opacity-100'
                  : 'bg-primary/20 animate-spin opacity-100'
                : 'opacity-0'
            }`}
            style={{ animationDuration: '3.5s' }}
          />

          <span
            className={`material-symbols-outlined text-xl relative z-10 drop-shadow-sm transition-transform duration-300 ${
              isPlaying ? 'animate-pulse' : ''
            }`}
          >
            {isPlaying ? 'music_note' : 'music_off'}
          </span>
        </button>
      )}

      {/* Expanded Player: Draggable anywhere on screen */}
      {musicExpanded && (
        <div
          className={`rounded-full px-4 py-2 sm:px-5 sm:py-2.5 flex items-center justify-between gap-3 relative overflow-hidden shadow-2xl max-w-[280px] sm:max-w-xs backdrop-blur-md border transition-all duration-300 animate-in fade-in zoom-in-95 ${
            isDark
              ? 'bg-[#180020]/95 border-pink-500/30 text-white shadow-[0_8px_30px_rgba(236,72,153,0.35)]'
              : 'bg-white/95 border-pink-200/80 text-slate-800 shadow-[0_8px_30px_rgba(255,94,156,0.2)]'
          }`}
        >
          <div
            onClick={handleNoteClick}
            className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0 cursor-pointer"
            title="Bấm để thu gọn (Kéo để di chuyển)"
          >
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center relative overflow-hidden flex-shrink-0 ${
                isDark ? 'bg-pink-500/20 text-pink-300' : 'bg-primary/15 text-primary'
              }`}
            >
              <div
                className={`absolute inset-0 rounded-full ${isPlaying ? 'animate-spin' : ''}`}
                style={{ animationDuration: '3s' }}
              />
              <span className="material-symbols-outlined text-base sm:text-lg relative z-10">
                music_note
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-[10px] sm:text-[11px] truncate font-bold uppercase tracking-wider ${
                  isDark ? 'text-pink-300' : 'text-primary'
                }`}
              >
                Nhạc nền
              </p>
              <p className="text-[9px] sm:text-[10px] opacity-70 truncate font-medium">
                {isPlaying ? 'Đang phát...' : 'Đã tạm dừng'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePlayClick}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-primary hover:bg-primary/90 text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform active:scale-95 flex-shrink-0 shadow-sm cursor-pointer"
            title={isPlaying ? 'Tạm dừng' : 'Phát tiếp'}
          >
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          {/* Audio Progress Line */}
          <div className="h-1 absolute bottom-0 left-0 right-0 bg-primary/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-200"
              style={{ width: `${audioProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingMusicPlayer;
