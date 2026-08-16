import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LovePage, Theme } from '../../types';
import api from '../../services/api';
import { ShaderBackground } from '../../components/ui/ShaderBackground';
import { ParticleBackground } from '../../components/ui/ParticleBackground';
import { useMusic } from '../../store/music.store';
import { SunflowerDuck } from '../../components/ui/SunflowerDuck';

const hexToRgb = (hex: string): string => {
  hex = hex.replace(/^#/, '');
  let r = 0, g = 0, b = 0;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  }
  return `${r}, ${g}, ${b}`;
};

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
  const [themeConfig, setThemeConfig] = useState<Theme | null>(null);

  // Style parameters loaded from the database configuration
  const pageBg = page.content.background || null;
  const pagePrimary = page.content.primaryColor || null;
  const pageSecondary = page.content.secondaryColor || null;
  const [activeLayout, setActiveLayout] = useState<string>(page.content.layout || 'classic');

  // Music Floater States & Handlers (same as CosmicGallery)
  const [musicExpanded, setMusicExpanded] = useState(false);
  const [musicPos, setMusicPos] = useState(() => {
    const isMobile = window.innerWidth <= 768;
    return {
      x: isMobile ? window.innerWidth - 72 : window.innerWidth - 120,
      y: 80
    };
  });
  const musicDragRef = useRef({ dragging: false, moved: false, startX: 0, startY: 0, startPosX: 0, startPosY: 0 });

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
      const nextX = Math.max(10, Math.min(window.innerWidth - 64, d.startPosX + dx));
      const nextY = Math.max(10, Math.min(window.innerHeight - 64, d.startPosY + dy));
      setMusicPos({ x: nextX, y: nextY });
    };
    const handleUp = () => { d.dragging = false; window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
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
      const nextX = Math.max(10, Math.min(window.innerWidth - 64, d.startPosX + dx));
      const nextY = Math.max(10, Math.min(window.innerHeight - 64, d.startPosY + dy));
      setMusicPos({ x: nextX, y: nextY });
    };
    const handleEnd = () => { d.dragging = false; window.removeEventListener('touchmove', handleMove); window.removeEventListener('touchend', handleEnd); };
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

  useEffect(() => {
    api.loves.incrementView(page.slug).catch(() => { });
  }, [page.slug]);

  // Fetch dynamic theme configuration
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const res = await api.themes.getThemeByKey(page.theme);
        if (res.success && res.data) {
          setThemeConfig(res.data);
        }
      } catch (e) {
        console.error("Error loading theme config:", e);
      }
    };
    fetchTheme();
  }, [page.theme]);

  // Sync activeLayout with theme configuration layout when loaded
  useEffect(() => {
    if (page.content.layout) {
      setActiveLayout(page.content.layout);
    } else if (themeConfig && themeConfig.layout) {
      setActiveLayout(themeConfig.layout);
    } else {
      const defaults: Record<string, string> = {
        cute: 'classic',
        romantic: 'classic',
        dark: 'classic'
      };
      setActiveLayout(defaults[page.theme] || 'classic');
    }
  }, [themeConfig, page.theme, page.content.layout]);

  const { title, content } = page;
  const messages = content.messages || [];
  const images = content.images || [];
  const music = content.music || '';
  
  // check if mainImage is present (Hero Image option)
  const mainCoverImage = content.mainImage || '';
  const hasCover = !!mainCoverImage;

  const galleryLayout = useMemo(() => {
    if (themeConfig && themeConfig.galleryLayout) {
      return themeConfig.galleryLayout;
    }
    const isLoverType = page.recipientType === 'LOVER' || page.recipientType === 'SPOUSE' || !page.recipientType;
    if (page.theme === 'romantic') return 'cosmic';
    if (page.theme === 'cute' || page.theme === 'dark') return 'polaroid';
    return isLoverType ? 'cosmic' : 'polaroid';
  }, [themeConfig, page]);

  const letterLabel = useMemo(() => {
    switch (page.recipientType) {
      case 'MOTHER': return 'Thư gửi Mẹ kính yêu 👩';
      case 'FATHER': return 'Thư gửi Cha kính yêu 👨';
      case 'GRANDPARENT': return 'Thư kính gửi Ông Bà 👵';
      case 'TEACHER': return 'Thư tri ân gửi Thầy Cô 🎓';
      case 'FAMILY': return 'Thư gửi gia đình thương yêu ❤️';
      case 'FRIEND': return 'Thư gửi bạn thân thiết 👭';
      case 'CHILD': return 'Thư gửi con yêu thương 👶';
      case 'OTHER': return 'Thư gửi lời thương mến ✨';
      default: return 'Thư gửi người thương ❤️';
    }
  }, [page.recipientType]);

  const heroMessage = messages[0] || "Trên thế gian này, không có trái tim nào dành cho anh như trái tim em.";
  const storyChapters = useMemo(() => messages.slice(1, -1).map(m => {
    const sep = m.indexOf('||');
    return sep > 0
      ? { title: m.slice(0, sep), content: m.slice(sep + 2) }
      : { title: '', content: m };
  }), [messages]);

  // If we have a cover, the first image is used as the cover, so chapters use images starting from index 1.
  // If we don't have a cover, chapters use images starting from index 0.
  const chapterImages = useMemo(() => {
    return hasCover ? images.slice(1) : images;
  }, [images, hasCover]);

  // Gallery images are the remaining images
  const galleryImages = useMemo(() => {
    return chapterImages.slice(storyChapters.length);
  }, [chapterImages, storyChapters.length]);

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

  // Default Fallbacks for cute, romantic, dark
  const defaultThemeConfigs: Record<string, Partial<Theme>> = {
    cute: {
      primaryColor: "#ff5e9c",
      secondaryColor: "#f1c40f",
      background: "linear-gradient(to bottom, #ffeef8, #ffd3eb)",
      font: "Inter",
      animation: "none",
      layout: "classic"
    },
    romantic: {
      primaryColor: "#e74c3c",
      secondaryColor: "#f1c40f",
      background: "linear-gradient(to bottom, #ffe3e3, #ffb3b3)",
      font: "Dancing Script",
      animation: "heart",
      layout: "classic"
    },
    dark: {
      primaryColor: "#a29bfe",
      secondaryColor: "#ffeaa7",
      background: "#1a1a2e",
      font: "Outfit",
      animation: "none",
      layout: "classic"
    }
  };

  const activeTheme = themeConfig || defaultThemeConfigs[page.theme] || defaultThemeConfigs.cute;

  // Custom overrides
  const currentBg = pageBg !== null ? pageBg : activeTheme.background;
  const currentPrimary = pagePrimary !== null ? pagePrimary : (activeTheme.primaryColor || '#ff5e9c');
  const currentSecondary = pageSecondary !== null ? pageSecondary : (activeTheme.secondaryColor || '#f1c40f');

  const isDark = pageBg !== null
    ? (pageBg === '#1a1a2e')
    : (page.theme === 'dark' || (themeConfig && themeConfig.key === 'dark'));

  // Dynamic colors and fonts mapping
  const themeStyle = {
    '--theme-primary': currentPrimary,
    '--theme-secondary': currentSecondary,
    fontFamily: activeTheme.font ? `'${activeTheme.font}', 'Inter', sans-serif` : 'inherit',
    color: isDark ? '#ffffff' : 'inherit'
  } as React.CSSProperties;

  return (
    <div
      style={themeStyle}
      className={`relative min-h-screen overflow-x-hidden ${isDark ? 'bg-[#1a1a2e]' : 'bg-background'}`}
    >
      {/* Dynamic style tag for Tailwind color overrides */}
      <style>
        {`
          .text-primary { color: var(--theme-primary) !important; }
          .bg-primary { background-color: var(--theme-primary) !important; }
          .border-primary { border-color: var(--theme-primary) !important; }
          .bg-primary\\/10 { background-color: rgba(${hexToRgb(currentPrimary)}, 0.1) !important; }
          .hover\\:bg-primary\\/20:hover { background-color: rgba(${hexToRgb(currentPrimary)}, 0.2) !important; }
          .hover\\:text-primary:hover { color: var(--theme-primary) !important; }
          .hover\\:bg-primary\\/10:hover { background-color: rgba(${hexToRgb(currentPrimary)}, 0.1) !important; }
          .border-primary\\/10 { border-color: rgba(${hexToRgb(currentPrimary)}, 0.1) !important; }
        `}
      </style>

      {/* Background rendering */}
      {isDark ? (
        <div className="absolute inset-0 z-[-2] bg-[#1a1a2e]" />
      ) : currentBg?.startsWith('linear-gradient') || currentBg?.startsWith('radial-gradient') ? (
        <div className="absolute inset-0 z-[-2]" style={{ background: currentBg }} />
      ) : currentBg?.startsWith('http') ? (
        <div className="absolute inset-0 z-[-2] bg-cover bg-center" style={{ backgroundImage: `url(${currentBg})` }} />
      ) : (
        <div className="absolute inset-0 z-[-2]" style={{ backgroundColor: currentBg || '#f8f9ff' }} />
      )}

      {/* Render active animation particles */}
      <ParticleBackground type={activeTheme.animation || 'none'} primaryColor={currentPrimary} />

      {!isDark && page.theme !== 'dark' && <ShaderBackground />}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="font-display text-h3 text-primary tracking-tight font-bold">Luvia</div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex bg-primary/10 backdrop-blur-md hover:bg-primary/20 text-primary px-4 py-2 rounded-full font-label-caps text-label-caps transition-all items-center gap-1.5 border border-primary/10 font-semibold">
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
            {mainCoverImage ? (
              <div ref={heroBgRef} className="w-full h-full bg-cover bg-center transition-transform duration-1000 scale-105"
                style={{ backgroundImage: `url(${mainCoverImage})` }} />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-container/10 to-secondary-container/15" />
            )}
            <div className={`absolute inset-0 bg-gradient-to-b from-transparent ${isDark ? 'via-[#1a1a2e]/20 to-[#1a1a2e]' : 'via-background/20 to-background'}`} />
          </div>
          <RevealSection className="relative z-10 text-center max-w-4xl">
            {!mainCoverImage && (
              <div className="flex justify-center mb-8 relative select-none">
                {/* Glowing background halo */}
                <div className="absolute inset-0 w-36 h-36 bg-primary/25 rounded-full filter blur-xl animate-pulse mx-auto" />
                {/* Floating duck component */}
                <div className="relative animate-float shadow-[0_0_35px_rgba(255,94,156,0.3)] rounded-full p-2.5 bg-white/40 backdrop-blur-sm border border-white/20">
                  <SunflowerDuck size={110} />
                </div>
              </div>
            )}
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



        {/* Story Chapters - Classic Layout */}
        {activeLayout === 'classic' && (
          <section className="max-w-5xl mx-auto py-12 px-6 space-y-16 md:space-y-24">
            {storyChapters.map((ch, idx) => {
              const isEven = idx % 2 === 0;
              const imgUrl = chapterImages[idx] || (chapterImages.length > 0 ? chapterImages[idx % chapterImages.length] : '');
              return (
                <RevealSection key={idx}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
                    <div className={`${isEven ? 'order-2 md:order-1' : 'order-2 md:pl-8'}`}>
                      <h2 className="font-h2 text-h2 text-primary mb-3 md:mb-4">{ch.title || `Chương ${idx + 1}`}</h2>
                      <p className="font-body-lg text-body-lg text-on-surface-variant italic mb-5 md:mb-8 leading-relaxed">{ch.content}</p>
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
        )}

        {/* Story Chapters - Timeline Layout */}
        {activeLayout === 'timeline' && (
          <section className="relative max-w-5xl mx-auto py-12 px-6 overflow-hidden">
            {/* Central Vertical Line */}
            <div className="absolute left-[38px] md:left-1/2 md:-translate-x-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/10" />

            <div className="space-y-16">
              {storyChapters.map((ch, idx) => {
                const isEven = idx % 2 === 0;
                const imgUrl = chapterImages[idx] || (chapterImages.length > 0 ? chapterImages[idx % chapterImages.length] : '');
                
                return (
                  <RevealSection key={idx} className="relative">
                    {/* Desktop View */}
                    <div className="hidden md:grid grid-cols-9 gap-4 items-center">
                      {/* Left Card */}
                      <div className={`col-span-4 ${isEven ? 'text-right' : 'opacity-0 pointer-events-none'}`}>
                        {isEven && (
                          <div className="glass-panel p-6 rounded-3xl dreamy-shadow border border-white/20 hover:scale-[1.02] transition-all duration-300 inline-block text-left w-full">
                            {imgUrl && (
                              <div className="rounded-2xl overflow-hidden mb-4 border border-white/10 shadow-sm">
                                <img className="w-full h-64 object-cover" src={imgUrl} alt={ch.title} />
                              </div>
                            )}
                            <h3 className="font-h2 text-h3 text-primary mb-2 font-bold">{ch.title || `Khoảnh khắc ${idx + 1}`}</h3>
                            <p className="font-body-lg text-body-lg text-on-surface-variant italic leading-relaxed">{ch.content}</p>
                            <div className="h-px w-16 bg-primary/20 mt-4" />
                          </div>
                        )}
                      </div>

                      {/* Timeline Dot (Col 5) */}
                      <div className="col-span-1 flex justify-center items-center relative h-full">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg border-4 border-white/80 z-10 animate-float" style={{ animationDelay: `${idx * 0.4}s` }}>
                          <span className="material-symbols-outlined text-[14px]">favorite</span>
                        </div>
                      </div>

                      {/* Right Card */}
                      <div className={`col-span-4 ${!isEven ? 'text-left' : 'opacity-0 pointer-events-none'}`}>
                        {!isEven && (
                          <div className="glass-panel p-6 rounded-3xl dreamy-shadow border border-white/20 hover:scale-[1.02] transition-all duration-300 inline-block text-left w-full">
                            {imgUrl && (
                              <div className="rounded-2xl overflow-hidden mb-4 border border-white/10 shadow-sm">
                                <img className="w-full h-64 object-cover" src={imgUrl} alt={ch.title} />
                              </div>
                            )}
                            <h3 className="font-h2 text-h3 text-primary mb-2 font-bold">{ch.title || `Khoảnh khắc ${idx + 1}`}</h3>
                            <p className="font-body-lg text-body-lg text-on-surface-variant italic leading-relaxed">{ch.content}</p>
                            <div className="h-px w-16 bg-primary/20 mt-4" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mobile View */}
                    <div className="flex md:hidden items-start">
                      {/* Left Dot alignment */}
                      <div className="flex-shrink-0 w-7 flex justify-center items-start pt-6 relative">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-md border-2 border-white z-10">
                          <span className="material-symbols-outlined text-[10px]">favorite</span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="flex-1 ml-4 glass-panel p-4 rounded-2xl border border-white/20 shadow-md">
                        {imgUrl && (
                          <div className="rounded-2xl overflow-hidden mb-4 border border-white/10 shadow-sm">
                            <img className="w-full h-64 object-cover" src={imgUrl} alt={ch.title} />
                          </div>
                        )}
                        <h3 className="font-h2 text-h3 text-primary mb-1 font-bold">{ch.title || `Khoảnh khắc ${idx + 1}`}</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant italic leading-relaxed">{ch.content}</p>
                        <div className="h-px w-12 bg-primary/20 mt-3" />
                      </div>
                    </div>
                  </RevealSection>
                );
              })}
            </div>
          </section>
        )}

        {/* Story Chapters - Split Layout */}
        {activeLayout === 'split' && (
          <section className="max-w-6xl mx-auto py-12 px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Sticky left panel showing the main hero or first photo */}
              <div className="lg:sticky lg:top-24 space-y-6">
                <div className="rounded-[2.5rem] overflow-hidden dreamy-shadow border border-white/10 relative">
                  {hasCover && images.length > 0 ? (
                    <img className="w-full aspect-video lg:aspect-[4/5] object-cover" src={images[0]} alt="Hero Memory" />
                  ) : (
                    <div className="w-full aspect-video lg:aspect-[4/5] bg-gradient-to-br from-primary-container/20 to-secondary-container/20 flex flex-col items-center justify-center p-8 relative">
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                      <div className="relative z-10 animate-float shadow-[0_0_30px_rgba(255,94,156,0.25)] rounded-full p-4 bg-white/40 border border-white/20">
                        <SunflowerDuck size={120} />
                      </div>
                      <p className="relative z-10 font-handwriting text-2xl mt-6 text-primary font-bold">Kỷ niệm ngọt ngào</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6 md:p-8 text-left">
                    <div className="text-white space-y-2">
                      <h2 className="font-display text-h2 font-bold leading-tight">{title}</h2>
                      <p className="font-body-lg text-white/80 font-handwriting text-xl">Kỷ niệm cùng thương yêu</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrolling right panel containing the chapters */}
              <div className="space-y-8 text-left">
                {storyChapters.map((ch, idx) => {
                  const imgUrl = chapterImages[idx] || '';
                  return (
                    <RevealSection key={idx} className="glass-panel p-5 md:p-8 rounded-[2rem] border border-white/20 shadow-md hover:shadow-lg transition-shadow">
                      <h3 className="font-h2 text-h2 text-primary mb-4 font-bold">{ch.title || `Chương ${idx + 1}`}</h3>
                      <p className="font-body-lg text-body-lg text-on-surface-variant italic mb-6 leading-relaxed">{ch.content}</p>
                      {imgUrl && (
                        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-sm mt-4">
                          <img className="w-full aspect-video object-cover" src={imgUrl} alt={ch.title} />
                        </div>
                      )}
                    </RevealSection>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Cosmic Gallery Link */}
        {galleryImages.length > 0 && (
          <section className="py-4xl px-6 text-center animate-fade-in relative overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(22, 0, 22, 0.4)' : `rgba(${hexToRgb(currentPrimary)}, 0.05)` }}>
            <div className="max-w-3xl mx-auto relative px-6 sm:px-24 py-4">
              {/* Mobile Ducks (Visible only on mobile, placed above text) */}
              <div className="flex justify-center gap-6 sm:hidden mb-4 select-none">
                <SunflowerDuck size={65} />
                <SunflowerDuck size={65} style={{ transform: 'scaleX(-1)' }} />
              </div>

              {/* Left Duck (Desktop/Tablet) */}
              <div className="absolute left-0 bottom-2 md:bottom-4 select-none hidden sm:block">
                <SunflowerDuck size={80} className="sm:w-[120px] sm:h-[120px] w-[70px] h-[70px]" />
              </div>

              <div className="space-y-6">
                <p className="font-handwriting text-3xl md:text-4xl font-bold" style={{ color: 'var(--theme-primary)' }}>
                  {galleryLayout === 'cosmic' 
                    ? 'Khoảnh khắc trong vũ trụ của chúng ta ✨' 
                    : 'Góc album kỷ niệm yêu thương 🖼️'}
                </p>
                <p className={isDark ? 'text-white/60 font-caption text-caption' : 'text-on-surface-variant font-caption text-caption'}>
                  {galleryLayout === 'cosmic'
                    ? 'Mỗi bức ảnh là một hành tinh chứa đầy kỷ niệm'
                    : 'Lưu giữ những khoảnh khắc ấm áp cùng nhau'}
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/page/${page.slug}/gallery`)}
                  className={`inline-flex items-center gap-2 px-8 py-4 rounded-full backdrop-blur-md border transition-all font-label-caps text-label-caps tracking-wider uppercase cursor-pointer ${
                    isDark
                      ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                      : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                  }`}
                >
                  <span className="material-symbols-outlined">auto_stories</span>
                  <span>{galleryLayout === 'cosmic' ? 'Khám phá vũ trụ' : 'Mở Album ảnh'}</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>

              {/* Right Duck (Desktop/Tablet - mirrored) */}
              <div className="absolute right-0 bottom-2 md:bottom-4 select-none hidden sm:block" style={{ transform: 'scaleX(-1)' }}>
                <SunflowerDuck size={80} className="sm:w-[120px] sm:h-[120px] w-[70px] h-[70px]" />
              </div>
            </div>
          </section>
        )}

        {/* Link to Letter Page if no gallery images */}
        {galleryImages.length === 0 && (
          <section className="py-4xl px-6 text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <p className="font-handwriting text-3xl md:text-4xl font-bold text-primary">
                {letterLabel}
              </p>
              <button
                onClick={() => navigate(`/page/${page.slug}/letter`)}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white hover:bg-primary/95 hover:scale-105 transition-all font-label-caps text-label-caps tracking-wider uppercase dreamy-shadow"
              >
                <span className="material-symbols-outlined">mail</span>
                <span>{page.recipientType === 'LOVER' || page.recipientType === 'SPOUSE' || !page.recipientType ? 'Đọc thư tình' : 'Đọc thư gửi đi'}</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Floating Music Player */}
      {music && (
        <div className="fixed z-50 animate-fade-in" style={{ left: musicPos.x, bottom: musicPos.y }}>
          {/* Collapsed: note icon only */}
          {!musicExpanded && (
            <div
              onClick={handleNoteClick}
              onMouseDown={handleMusicMouseDown}
              onTouchStart={handleMusicTouchStart}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden shadow-lg"
            >
              <div className={`absolute inset-0 bg-primary/20 rounded-full ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
              <span className="material-symbols-outlined text-white text-xl relative z-10 pointer-events-none">music_note</span>
            </div>
          )}

          {/* Expanded: full player */}
          {musicExpanded && (
            <div className={`${isDark ? 'bg-[#16213e]/90 backdrop-blur-md' : 'glass-panel'} dreamy-shadow rounded-full px-6 py-3 flex items-center justify-between gap-4 border border-white/10 relative overflow-hidden shadow-lg max-w-xs`}>
              <div
                onClick={handleNoteClick}
                onMouseDown={handleMusicMouseDown}
                onTouchStart={handleMusicTouchStart}
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
      )}

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
