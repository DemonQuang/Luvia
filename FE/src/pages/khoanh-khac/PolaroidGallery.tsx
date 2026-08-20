import React, { useState, useCallback } from 'react';
import { ParticleBackground } from '../../components/ui/ParticleBackground';
import { FloatingMusicPlayer } from '../../components/common/FloatingMusicPlayer';
import { ImageLightbox } from '../../components/common/ImageLightbox';

interface PolaroidGalleryProps {
  images: string[];
  title?: string;
  music?: string;
  onNext?: () => void;
  onBack?: () => void;
}

export const PolaroidGallery: React.FC<PolaroidGalleryProps> = ({ images, title, music, onNext, onBack }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleCloseModal = useCallback(() => setSelectedIndex(null), []);

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
    <section className="relative w-full min-h-screen overflow-y-auto bg-gradient-to-br from-amber-50/40 via-rose-50/30 to-purple-50/20 py-24 px-4 sm:px-6 md:px-12 flex flex-col items-center">
      {/* Light particle background */}
      <ParticleBackground type="light" primaryColor="#ff8fab" />

      {/* Navigation Header */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between shadow-sm border-b border-gray-100/80 w-full">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gray-100/90 hover:bg-gray-200 text-gray-700 transition-all text-[11px] sm:text-xs font-semibold active:scale-95 whitespace-nowrap shadow-sm"
          >
            <span className="material-symbols-outlined text-sm sm:text-base">arrow_back</span>
            <span className="hidden sm:inline">Quay lại</span>
          </button>
        ) : <div className="w-[60px] sm:w-[100px]" />}

        <div className="flex flex-col items-center text-center max-w-[50%] md:max-w-[60%]">
          <h1 className="text-xs sm:text-base md:text-lg font-bold text-gray-800 font-display line-clamp-1">
            Góc Kỷ Niệm Của {title || 'Chúng Ta'}
          </h1>
          <p className="text-[9px] md:text-xs text-gray-500 italic mt-0.5 line-clamp-1">
            Lưu giữ những khoảnh khắc quý giá
          </p>
        </div>

        {onNext ? (
          <button
            onClick={onNext}
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white transition-all text-xs sm:text-sm font-medium shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <span>Tiếp tới</span>
            <span className="material-symbols-outlined text-sm sm:text-base">arrow_forward</span>
          </button>
        ) : <div className="w-[60px] sm:w-[100px]" />}
      </div>

      {/* Polaroid Wall Grid with uniform square cards */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 mt-8">
        {images.map((imgUrl, index) => {
          // Generate slightly different rotations for realistic Polaroid wall feel
          const rotationClass =
            index % 3 === 0 ? 'hover:rotate-1' :
            index % 3 === 1 ? 'hover:-rotate-1' : 'hover:rotate-2';

          return (
            <div
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`bg-white p-4 pb-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-gray-100 cursor-pointer transition-all duration-300 transform hover:scale-[1.03] ${rotationClass} flex flex-col space-y-4 animate-fade-in`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center relative">
                <img
                  src={imgUrl}
                  alt={`Kỷ niệm ${index + 1}`}
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="text-center font-handwriting text-lg text-gray-700 select-none px-2 leading-relaxed">
                {defaultCaptions[index % defaultCaptions.length]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Next Step Section */}
      {onNext && (
        <div className="mt-14 mb-8 text-center flex flex-col items-center space-y-3 animate-fade-in max-w-md mx-auto px-4">
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-medium text-xs sm:text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span>Tiếp tới</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      )}

      {/* Synchronized Floating Music Player */}
      <FloatingMusicPlayer music={music} isDark={false} />

      {/* Image Lightbox with Previous/Next Navigation */}
      <ImageLightbox
        images={images}
        currentIndex={selectedIndex}
        captions={defaultCaptions}
        onClose={handleCloseModal}
        onNavigate={(newIdx) => setSelectedIndex(newIdx)}
      />
    </section>
  );
};
export default PolaroidGallery;
