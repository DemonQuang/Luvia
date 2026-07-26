import React, { useState, useEffect, useRef } from 'react';

interface MusicCardProps {
  musicUrl: string;
}

export const MusicCard: React.FC<MusicCardProps> = ({ musicUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Recreate/update audio source when URL changes
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(musicUrl);
    audio.loop = true;
    audioRef.current = audio;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener('timeupdate', updateProgress);

    // Reset state
    setIsPlaying(false);
    setProgress(0);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.pause();
    };
  }, [musicUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error("Audio playback error: ", err);
          alert("Click anywhere on the screen first to enable audio playback.");
        });
    }
  };

  return (
    <div className="glass-panel p-4 rounded-2xl dreamy-shadow flex items-center justify-between space-x-4 max-w-sm w-full mx-auto relative overflow-hidden">
      {/* Dynamic Waveform Visualizer */}
      <div className="absolute inset-x-0 bottom-0 h-1 flex justify-center items-end opacity-20 space-x-[2px] pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="w-[2px] bg-primary rounded-t-full transition-all duration-300"
            style={{
              height: isPlaying ? `${Math.floor(Math.random() * 12) + 2}px` : '2px',
              animation: isPlaying ? `float ${Math.random() * 1.5 + 0.8}s ease-in-out infinite` : 'none',
              animationDelay: `${i * 0.05}s`
            }}
          />
        ))}
      </div>

      <div className="flex items-center space-x-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        {/* Music Meta */}
        <div>
          <span className="font-caption text-xs font-semibold text-primary block">Nhạc nền kỷ niệm</span>
          <span className="text-xs text-on-surface-variant font-medium line-clamp-1 max-w-[150px]">
            Melody of Love
          </span>
        </div>
      </div>

      {/* Progress slider bar */}
      <div className="flex-1 max-w-[100px] h-1.5 bg-surface-container-high rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
export default MusicCard;
