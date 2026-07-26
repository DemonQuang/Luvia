import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LovePage } from '../../types';
import api from '../../services/api';
import { ShaderBackground } from '../../components/ui/ShaderBackground';
import { HeartsBackground } from '../../components/ui/HeartsBackground';
import { useMusic } from '../../store/music.store';

interface LovePageViewProps {
  page: LovePage;
}

const RevealSection: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`transition-all duration-1000 ease-out ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </div>
  );
};

export const LovePageView: React.FC<LovePageViewProps> = ({ page }) => {
  const navigate = useNavigate();
  const { isPlaying, progress: audioProgress, togglePlay, playMusic, pauseMusic, currentMusic } = useMusic();
  const [showToast, setShowToast] = useState(false);
  const heroBgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.loves.incrementView(page.slug).catch(() => { });
  }, [page.slug]);

  const { title, theme, content } = page;
  const messages = content.messages || [];
  const images = content.images || [];
  const music = content.music || '';

  const heroMessage = messages[0] || "Trên thế gian này, không có trái tim nào dành cho anh như trái tim em.";
  const storyChapters = useMemo(() => messages.slice(1, -1).map(m => {
    const sep = m.indexOf('||');
    return sep > 0
      ? { title: m.slice(0, sep), content: m.slice(sep + 2) }
      : { title: '', content: m };
  }), [messages]);
  const galleryImages = useMemo(() => images.slice(storyChapters.length), [images, storyChapters.length]);

  // Audio setup
  useEffect(() => {
    if (music) {
      if (music !== currentMusic) {
        playMusic(music);
      }
    } else {
      pauseMusic();
    }

    return () => {
      // Pause music if we are leaving the love page views
      if (!window.location.pathname.startsWith('/page/')) {
        pauseMusic();
      }
    };
  }, [music, currentMusic, playMusic, pauseMusic]);

  // Parallax
  useEffect(() => {
    const handleScroll = () => {
      if (heroBgRef.current) {
        heroBgRef.current.style.transform = `scale(1.05) translateY(${window.pageYOffset * 0.3}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch { }
  }, []);

  const isDark = theme === 'dark';

  return (
    <div className={`relative min-h-screen overflow-x-hidden ${isDark ? 'bg-[#1a1a2e] text-white' : 'bg-background text-on-background'}`}>
      {!isDark && <ShaderBackground />}
      {theme === 'romantic' && (
        <div className="fixed inset-0 z-[-1] pointer-events-none mix-blend-screen opacity-60">
          <HeartsBackground />
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="font-display text-h3 text-primary tracking-tight font-bold">Luvia</div>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 backdrop-blur-md hover:bg-primary/20 text-primary px-4 py-2 rounded-full font-label-caps text-label-caps transition-all flex items-center gap-1.5 border border-primary/10 font-semibold">
            <span className="material-symbols-outlined text-sm">favorite</span>
            <span>{title}</span>
          </div>
          <button onClick={handleShare} className="bg-surface-container-lowest/80 backdrop-blur-md hover:bg-primary/10 text-on-surface-variant hover:text-primary p-2.5 rounded-full transition-all flex items-center justify-center dreamy-shadow border border-white/20" title="Chia sẻ">
            <span className="material-symbols-outlined text-lg">share</span>
          </button>
        </div>
      </header>

      <main className="relative">
        {/* Hero */}
        <section className="min-h-screen flex items-center justify-center relative px-6 overflow-hidden">
          <div className="absolute inset-0 z-0">
            {images.length > 0 ? (
              <div ref={heroBgRef} className="w-full h-full bg-cover bg-center transition-transform duration-1000 scale-105"
                style={{ backgroundImage: `url(${images[0]})` }} />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-container/20 to-secondary-container/25" />
            )}
            <div className={`absolute inset-0 bg-gradient-to-b from-transparent ${isDark ? 'via-[#1a1a2e]/20 to-[#1a1a2e]' : 'via-background/20 to-background'}`} />
          </div>
          <RevealSection className="relative z-10 text-center max-w-4xl">
            <p className="font-label-caps text-label-caps text-primary mb-4 tracking-[0.2em] uppercase font-semibold">{title}</p>
            <h1 className="font-display text-h1-mobile md:text-h1 leading-tight mb-8 px-4 italic font-bold" style={{ color: isDark ? '#f8f9ff' : undefined }}>
              "{heroMessage}"
            </h1>
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center animate-bounce">
                <span className="material-symbols-outlined text-primary">expand_more</span>
              </div>
            </div>
          </RevealSection>
        </section>

        {/* Story Chapters */}
        <section className="max-w-5xl mx-auto py-4xl px-6 space-y-4xl">
          {storyChapters.map((ch, idx) => {
            const isEven = idx % 2 === 0;
            const imgUrl = images[idx] || (images.length > 0 ? images[idx % images.length] : '');
            return (
              <RevealSection key={idx}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-xl items-center">
                  <div className={`${isEven ? 'order-2 md:order-1' : 'order-2 md:pl-xl'}`}>
                    <h2 className="font-h2 text-h2 text-primary mb-base">{ch.title || `Chương ${idx + 1}`}</h2>
                    <p className="font-body-lg text-body-lg text-on-surface-variant italic mb-lg leading-relaxed">{ch.content}</p>
                    <div className="h-px w-24 bg-primary/20" />
                  </div>
                  <div className={`${isEven ? 'order-1 md:order-2' : 'order-1'}`}>
                    <div className="rounded-3xl overflow-hidden dreamy-shadow transform hover:rotate-0 transition-transform duration-500 border border-white/10">
                      {imgUrl ? (
                        <img className="w-full aspect-[4/5] object-cover" src={imgUrl} alt={ch.title || `Chương ${idx + 1}`} />
                      ) : (
                        <div className="w-full aspect-[4/5] bg-surface-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-5xl text-primary-container">favorite</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </RevealSection>
            );
          })}
        </section>

        {/* Cosmic Gallery Link */}
        {galleryImages.length > 0 && (
          <section className="py-4xl px-6 text-center" style={{ backgroundColor: '#160016' }}>
            <div className="max-w-2xl mx-auto space-y-6">
              <p className="font-handwriting text-3xl md:text-4xl font-bold" style={{ color: 'rgb(252, 24, 210)' }}>
                Khoảnh khắc trong vũ trụ của chúng ta ✨
              </p>
              <p className="text-white/60 font-caption text-caption">
                Mỗi bức ảnh là một hành tinh chứa đầy kỷ niệm
              </p>
              <button
                onClick={() => navigate(`/page/${page.slug}/gallery`)}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all font-label-caps text-label-caps tracking-wider uppercase"
              >
                <span className="material-symbols-outlined">auto_stories</span>
                <span>Khám phá vũ trụ</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </section>
        )}

        {/* Link to Letter Page if no gallery images */}
        {galleryImages.length === 0 && (
          <section className="py-4xl px-6 text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <p className="font-handwriting text-3xl md:text-4xl font-bold text-primary">
                Thư gửi người anh yêu ❤️
              </p>
              <button
                onClick={() => navigate(`/page/${page.slug}/letter`)}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white hover:bg-primary/95 hover:scale-105 transition-all font-label-caps text-label-caps tracking-wider uppercase dreamy-shadow"
              >
                <span className="material-symbols-outlined">mail</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Floating Music Player */}
      {music && (() => {
        const MusicFloater: React.FC = () => {
          const [expanded, setExpanded] = useState(false);
          const [pos, setPos] = useState({ x: 24, y: 24 });
          const dragRef = useRef({ dragging: false, moved: false, startX: 0, startY: 0, startPosX: 0, startPosY: 0 });

          const handleMouseDown = useCallback((e: React.MouseEvent) => {
            e.preventDefault();
            const d = dragRef.current;
            d.dragging = true;
            d.moved = false;
            d.startX = e.clientX;
            d.startY = e.clientY;
            d.startPosX = pos.x;
            d.startPosY = pos.y;

            const handleMove = (ev: MouseEvent) => {
              if (!d.dragging) return;
              const dx = ev.clientX - d.startX;
              const dy = ev.clientY - d.startY;
              if (Math.abs(dx) > 5 || Math.abs(dy) > 5) d.moved = true;
              setPos({ x: d.startPosX + dx, y: d.startPosY + dy });
            };
            const handleUp = () => { d.dragging = false; window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleUp);
          }, [pos.x, pos.y]);

          const handleTouchStart = useCallback((e: React.TouchEvent) => {
            const touch = e.touches[0];
            const d = dragRef.current;
            d.dragging = true;
            d.moved = false;
            d.startX = touch.clientX;
            d.startY = touch.clientY;
            d.startPosX = pos.x;
            d.startPosY = pos.y;

            const handleMove = (ev: TouchEvent) => {
              const t = ev.touches[0];
              const dx = t.clientX - d.startX;
              const dy = t.clientY - d.startY;
              if (Math.abs(dx) > 5 || Math.abs(dy) > 5) d.moved = true;
              setPos({ x: d.startPosX + dx, y: d.startPosY + dy });
            };
            const handleEnd = () => { d.dragging = false; window.removeEventListener('touchmove', handleMove); window.removeEventListener('touchend', handleEnd); };
            window.addEventListener('touchmove', handleMove);
            window.addEventListener('touchend', handleEnd);
          }, [pos.x, pos.y]);

          const handleNoteClick = useCallback(() => {
            if (!dragRef.current.moved) setExpanded(p => !p);
          }, []);

          const handlePlayClick = useCallback((e: React.MouseEvent) => {
            e.stopPropagation();
            togglePlay();
          }, [togglePlay]);

          return (
            <div className="fixed z-50" style={{ left: pos.x, bottom: pos.y }}>
              {/* Collapsed: note icon only */}
              {!expanded && (
                <div
                  onClick={handleNoteClick}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden shadow-lg"
                >
                  <div className={`absolute inset-0 bg-primary/20 rounded-full ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                  <span className="material-symbols-outlined text-white text-xl relative z-10 pointer-events-none">music_note</span>
                </div>
              )}

              {/* Expanded: full player */}
              {expanded && (
                <div className={`${isDark ? 'bg-[#16213e]/90 backdrop-blur-md' : 'glass-panel'} dreamy-shadow rounded-full px-6 py-3 flex items-center justify-between gap-4 border border-white/10 relative overflow-hidden shadow-lg max-w-xs`}>
                  <div
                    onClick={handleNoteClick}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    className="flex items-center gap-4 flex-1 min-w-0 cursor-grab active:cursor-grabbing"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center relative overflow-hidden">
                      <div className={`absolute inset-0 bg-primary/20 rounded-full ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                      <span className="material-symbols-outlined text-primary text-xl relative z-10 pointer-events-none">music_note</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label-caps text-label-caps text-primary truncate font-semibold pointer-events-none">Nhạc nền</p>
                      <p className="font-caption text-[10px] text-on-surface-variant truncate uppercase tracking-tighter pointer-events-none">Kỷ niệm của chúng ta</p>
                    </div>
                  </div>
                  <button onClick={handlePlayClick} className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform active:scale-95 flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{isPlaying ? 'pause' : 'play_arrow'}</span>
                  </button>
                  <div className="h-1 absolute bottom-0 left-0 right-0 bg-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-200" style={{ width: `${audioProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
          );
        };
        return <MusicFloater />;
      })()}

      {/* Footer */}

      {/* Share Toast */}
      <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-full font-label-caps text-label-caps dreamy-shadow transition-all duration-500 flex items-center gap-2 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <span className="material-symbols-outlined text-sm">check_circle</span>
        <span>Đã sao chép liên kết chia sẻ!</span>
      </div>
    </div>
  );
};

export default LovePageView;
