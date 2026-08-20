import React, { useEffect, useCallback, useRef } from 'react';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
  captions?: string[];
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  currentIndex,
  onClose,
  onNavigate,
  captions,
}) => {
  const touchStartXRef = useRef<number | null>(null);

  const total = images.length;
  const isOpen = currentIndex !== null && currentIndex >= 0 && currentIndex < total;

  const handlePrev = useCallback(() => {
    if (currentIndex === null || total === 0) return;
    const prevIndex = (currentIndex - 1 + total) % total;
    onNavigate(prevIndex);
  }, [currentIndex, total, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex === null || total === 0) return;
    const nextIndex = (currentIndex + 1) % total;
    onNavigate(nextIndex);
  }, [currentIndex, total, onNavigate]);

  // Keyboard navigation: Left, Right, Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  // Touch swipe handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartXRef.current;

    // Minimum swipe distance threshold (50px)
    if (diff > 50) {
      handlePrev();
    } else if (diff < -50) {
      handleNext();
    }
    touchStartXRef.current = null;
  };

  if (!isOpen || currentIndex === null) return null;

  const currentImage = images[currentIndex];
  const currentCaption = captions && captions[currentIndex % captions.length];

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-fade-in"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Bar: Image Index Counter & Close Button */}
      <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-20 pointer-events-none">
        <div className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs sm:text-sm font-semibold pointer-events-auto shadow-md">
          <span>{currentIndex + 1}</span>
          <span className="opacity-60 mx-1">/</span>
          <span className="opacity-60">{total}</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 hover:text-white flex items-center justify-center transition-all pointer-events-auto active:scale-95 shadow-md"
          title="Đóng (Esc)"
        >
          <span className="material-symbols-outlined text-xl sm:text-2xl">close</span>
        </button>
      </div>

      {/* Left Navigation Arrow */}
      {total > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/15 hover:bg-white/30 active:scale-90 border border-white/20 text-white flex items-center justify-center backdrop-blur-md shadow-2xl transition-all"
          title="Ảnh trước (Mũi tên trái)"
        >
          <span className="material-symbols-outlined text-2xl sm:text-3xl">chevron_left</span>
        </button>
      )}

      {/* Image Display Area with uniform proportion */}
      <div
        className="relative max-w-4xl max-h-[82vh] w-full flex flex-col items-center justify-center p-2 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex items-center justify-center overflow-hidden rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-white/15 bg-black/40">
          <img
            key={currentImage}
            src={currentImage}
            alt={`Ảnh kỷ niệm ${currentIndex + 1}`}
            className="max-h-[70vh] sm:max-h-[75vh] w-auto max-w-full object-contain rounded-2xl transition-all duration-300 animate-fade-in"
            draggable={false}
          />
        </div>

        {/* Optional Caption */}
        {currentCaption && (
          <p className="mt-3 text-center text-white/90 font-handwriting text-lg sm:text-xl tracking-wide max-w-xl px-4 line-clamp-2 drop-shadow-md">
            {currentCaption}
          </p>
        )}
      </div>

      {/* Right Navigation Arrow */}
      {total > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/15 hover:bg-white/30 active:scale-90 border border-white/20 text-white flex items-center justify-center backdrop-blur-md shadow-2xl transition-all"
          title="Ảnh tiếp theo (Mũi tên phải)"
        >
          <span className="material-symbols-outlined text-2xl sm:text-3xl">chevron_right</span>
        </button>
      )}
    </div>
  );
};

export default ImageLightbox;
