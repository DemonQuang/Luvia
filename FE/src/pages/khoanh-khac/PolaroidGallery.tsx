import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useMusic } from '../../store/music.store';
import { ParticleBackground } from '../../components/ui/ParticleBackground';

interface PolaroidGalleryProps {
  images: string[];
  title?: string;
  music?: string;
  onNext?: () => void;
  onBack?: () => void;
}

export const PolaroidGallery: React.FC<PolaroidGalleryProps> = ({ images, title, music, onNext, onBack }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { isPlaying, progress: audioProgress, togglePlay, playMusic, pauseMusic, currentMusic } = useMusic();

  // Floating Music Player position states
  const [musicExpanded, setMusicExpanded] = useState(false);
  const [musicPos, setMusicPos] = useState({ x: 24, y: 24 });
  const musicDragRef = useRef({ dragging: false, moved: false, startX: 0, startY: 0, startPosX: 0, startPosY: 0 });

  // Music setup
  useEffect(() => {
    if (music) {
      if (music !== currentMusic) {
        playMusic(music);
      }
    } else {
      pauseMusic();
    }

    return () => {
      if (!window.location.pathname.startsWith('/page/')) {
        pauseMusic();
      }
    };
  }, [music, currentMusic, playMusic, pauseMusic]);

  // Draggable Music Player handlers
  const handleMusicMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const d = musicDragRef.current;
    d.dragging = true;
    d.moved = false;
    d.startX = e.clientX;
    d.startY = e.clientY;
    d.startPosX = musicPos.x;
    d.startPosY = musicPos.y;

    const handleMove = (ev: MouseEvent) => {
      if (!d.dragging) return;
      const dx = ev.clientX - d.startX;
      const dy = ev.clientY - d.startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) d.moved = true;
      setMusicPos({ x: d.startPosX + dx, y: d.startPosY + dy });
    };
    const handleUp = () => {
      d.dragging = false;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [musicPos.x, musicPos.y]);

  const handleMusicTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const d = musicDragRef.current;
    d.dragging = true;
    d.moved = false;
    d.startX = touch.clientX;
    d.startY = touch.clientY;
    d.startPosX = musicPos.x;
    d.startPosY = musicPos.y;

    const handleMove = (ev: TouchEvent) => {
      const t = ev.touches[0];
      const dx = t.clientX - d.startX;
      const dy = t.clientY - d.startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) d.moved = true;
      setPos({ x: d.startPosX + dx, y: d.startPosY + dy });
    };
    const handleEnd = () => {
      d.dragging = false;
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
    // local state set helper for touch
    const setPos = (val: { x: number; y: number }) => setMusicPos(val);

    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
  }, [musicPos.x, musicPos.y]);

  const handleNoteClick = useCallback(() => {
    if (!musicDragRef.current.moved) setMusicExpanded(p => !p);
  }, []);

  const handlePlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlay();
  }, [togglePlay]);

  const handleCloseModal = useCallback(() => setSelectedImage(null), []);

  const defaultCaptions = [
    "Khoảnh khắc đong đầy tình cảm 🌸",
    "Nụ cười rạng rỡ, ngập tràn niềm vui ✨",
    "Kỷ niệm bình yên bên những người thương ❤️",
    "Ngày ý nghĩa, trọn vẹn hạnh phúc 🏡",
    "Khoảnh khắc ấm áp và yêu thương vô bờ 💖",
    "Gia đình là bến đỗ bình an nhất 🌳",
    "Mãi ghi dấu những bước đi cùng nhau 👣",
    "Nụ cười rạng ngời sưởi ấm trái tim ☀️",
    "Nhìn lại chặng đường ngập tràn tiếng cười 🎉",
    "Món quà tinh thần gửi trọn yêu thương 🎁"
  ];

  if (images.length === 0) return null;

  return (
    <section className="relative w-full min-h-screen overflow-y-auto bg-gradient-to-br from-amber-50/40 via-rose-50/30 to-purple-50/20 py-24 px-6 md:px-12 flex flex-col items-center">
      {/* Light particle background */}
      <ParticleBackground type="light" primaryColor="#ff8fab" />

      {/* Navigation Header */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/70 backdrop-blur-md px-4 md:px-6 flex items-center justify-between shadow-sm border-b border-gray-100 w-full">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all text-xs font-semibold active:scale-95"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Quay lại</span>
          </button>
        ) : <div className="w-[84px]" />}

        <div className="flex flex-col items-center text-center">
          <h1 className="text-sm md:text-lg font-bold text-gray-800 font-display">
            Góc Kỷ Niệm Của {title || 'Chúng Ta'}
          </h1>
          <p className="text-[10px] md:text-xs text-gray-500 italic mt-0.5">
            Lưu giữ những khoảnh khắc quý giá
          </p>
        </div>

        {onNext ? (
          <button
            onClick={onNext}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white hover:opacity-95 transition-all text-xs font-semibold shadow-md active:scale-95"
          >
            <span>Đọc thư</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        ) : <div className="w-[84px]" />}
      </div>

      {/* Polaroid Wall Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 mt-8">
        {images.map((imgUrl, index) => {
          // Generate slightly different rotations for realistic Polaroid wall feel
          const rotationClass =
            index % 3 === 0 ? 'hover:rotate-1' :
            index % 3 === 1 ? 'hover:-rotate-1' : 'hover:rotate-2';

          return (
            <div
              key={index}
              onClick={() => setSelectedImage(imgUrl)}
              className={`bg-white p-4 pb-8 rounded-md shadow-[0_4px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.12)] border border-gray-100/50 cursor-pointer transition-all duration-300 transform hover:scale-[1.03] ${rotationClass} flex flex-col space-y-4 animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="aspect-square w-full overflow-hidden rounded-sm bg-gray-50">
                <img
                  src={imgUrl}
                  alt={`Kỷ niệm ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="text-center font-handwriting text-lg text-gray-600 mt-2 select-none px-2 leading-relaxed">
                {defaultCaptions[index % defaultCaptions.length]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Music player controls */}
      {music && (
        <div className="fixed z-50" style={{ left: musicPos.x, bottom: musicPos.y }}>
          {!musicExpanded && (
            <div
              onClick={handleNoteClick}
              onMouseDown={handleMusicMouseDown}
              onTouchStart={handleMusicTouchStart}
              className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-gray-200 flex items-center justify-center hover:bg-white transition-all cursor-grab active:cursor-grabbing relative overflow-hidden shadow-md"
            >
              <div className={`absolute inset-0 bg-primary/10 rounded-full ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
              <span className="material-symbols-outlined text-primary text-xl relative z-10 pointer-events-none">music_note</span>
            </div>
          )}

          {musicExpanded && (
            <div className="bg-white/95 backdrop-blur-md rounded-full px-5 py-2.5 flex items-center justify-between gap-4 border border-gray-200 relative overflow-hidden shadow-lg max-w-xs text-gray-800">
              <div
                onClick={handleNoteClick}
                onMouseDown={handleMusicMouseDown}
                onTouchStart={handleMusicTouchStart}
                className="flex items-center gap-4 flex-1 min-w-0 cursor-grab active:cursor-grabbing"
              >
                <div className="w-9 h-9 rounded-full bg-primary-container/20 flex items-center justify-center relative overflow-hidden">
                  <div className={`absolute inset-0 bg-primary/15 rounded-full ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                  <span className="material-symbols-outlined text-primary text-lg relative z-10 pointer-events-none">music_note</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label-caps text-[10px] text-primary truncate font-semibold pointer-events-none uppercase">Nhạc nền</p>
                  <p className="font-caption text-[9px] text-gray-500 truncate pointer-events-none">Bài hát kỷ niệm</p>
                </div>
              </div>
              <button onClick={handlePlayClick} className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform active:scale-95 flex-shrink-0">
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{isPlaying ? 'pause' : 'play_arrow'}</span>
              </button>
              <div className="h-1 absolute bottom-0 left-0 right-0 bg-primary/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-200" style={{ width: `${audioProgress}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Photo zoom modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full" onClick={e => e.stopPropagation()}>
            <img src={selectedImage} alt="" className="w-full h-full object-contain rounded-xl shadow-2xl" />
            <button onClick={handleCloseModal} className="absolute -top-12 right-0 text-white/80 hover:text-white p-2 transition-colors">
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
export default PolaroidGallery;
