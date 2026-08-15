import React, { useState, useEffect, useRef } from 'react';

interface AudioPreviewButtonProps {
  src: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const AudioPreviewButton: React.FC<AudioPreviewButtonProps> = ({ src, size = 'md', className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
  }, [src]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const togglePlay = () => {
    if (!src) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const dimension = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 'text-base' : 'text-xl';

  return (
    <button
      type="button"
      onClick={togglePlay}
      disabled={!src}
      title={src ? (isPlaying ? 'Dừng nghe thử' : 'Nghe thử') : 'Chưa có tệp âm thanh'}
      className={`${dimension} rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      <span className={`material-symbols-outlined ${iconSize}`} style={{ fontVariationSettings: "'FILL' 1" }}>
        {isPlaying ? 'pause' : (src ? 'play_arrow' : 'music_off')}
      </span>
    </button>
  );
};

export default AudioPreviewButton;