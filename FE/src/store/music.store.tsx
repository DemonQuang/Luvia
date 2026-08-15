import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

interface MusicContextType {
  isPlaying: boolean;
  progress: number;
  currentMusic: string;
  togglePlay: () => void;
  playMusic: (url: string) => void;
  pauseMusic: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentMusic, setCurrentMusic] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create a single audio element that persists
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    const updateProgress = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  const playMusic = useCallback((url: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    const absoluteUrl = url ? new URL(url, window.location.href).href : '';
    if (audio.src !== absoluteUrl) {
      audio.src = absoluteUrl;
      audio.load();
    }
    setCurrentMusic(url);
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      setIsPlaying(false);
    });
  }, []);

  const pauseMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  return (
    <MusicContext.Provider value={{ isPlaying, progress, currentMusic, togglePlay, playMusic, pauseMusic }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

export default MusicContext;