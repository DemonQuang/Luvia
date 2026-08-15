import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { LovePage, Theme } from '../../types';
import { useMusic } from '../../store/music.store';
import { ParticleBackground } from '../../components/ui/ParticleBackground';
import './LetterPage.scss';

export const LetterPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [lovePage, setLovePage] = useState<LovePage | null>(null);
  const [themeConfig, setThemeConfig] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Magical Garden & Envelope States
  const [loaded, setLoaded] = useState(false);
  const [showEnvelope, setShowEnvelope] = useState(false);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [letterExpanded, setLetterExpanded] = useState(false);
  const [endingActive, setEndingActive] = useState(false);

  // Floating Music Player state
  const { isPlaying, progress: audioProgress, togglePlay, playMusic, pauseMusic, currentMusic } = useMusic();

  // Music Floater States & Handlers (same as CosmicGallery)
  const [musicExpanded, setMusicExpanded] = useState(false);
  const [musicPos, setMusicPos] = useState({ x: 24, y: 24 });
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
      setMusicPos({ x: d.startPosX + dx, y: d.startPosY + dy });
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
      setMusicPos({ x: d.startPosX + dx, y: d.startPosY + dy });
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

  // Load love page data
  useEffect(() => {
    if (!slug) return;

    const pinToken = sessionStorage.getItem(`pin_token_${slug}`);
    if (!pinToken) {
      navigate(`/page/${slug}`, { replace: true });
      return;
    }

    const fetchPage = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.loves.getLovePageBySlug(slug, pinToken);
        if (res.success && res.data) {
          setLovePage(res.data);
        } else {
          setError('Không tìm thấy nội dung.');
        }
      } catch {
        setError('Lỗi khi tải trang.');
        navigate(`/page/${slug}`, { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug, navigate]);

  // Remove "not-loaded" class after 1 second
  useEffect(() => {
    if (!loading && lovePage) {
      const timer = setTimeout(() => {
        setLoaded(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, lovePage]);

  const lovePageData = lovePage;
  const content = lovePageData?.content;
  const messages = content?.messages || [];
  const music = content?.music || '';
  const lastMessage = messages[messages.length - 1] || "Mãi yêu em!";

  // Fetch theme configuration when lovePage changes
  useEffect(() => {
    if (!lovePage) return;
    const fetchTheme = async () => {
      try {
        const res = await api.themes.getThemeByKey(lovePage.theme);
        if (res.success && res.data) {
          setThemeConfig(res.data);
        }
      } catch (e) {
        console.error("Error loading theme config in Letter Page:", e);
      }
    };
    fetchTheme();
  }, [lovePage]);

  const isLoverStyle = useMemo(() => {
    if (themeConfig && themeConfig.letterLayout) {
      return themeConfig.letterLayout === 'flowers';
    }
    // Fallback logic
    if (!lovePage) return true;
    if (lovePage.theme === 'romantic') return true;
    if (lovePage.theme === 'cute' || lovePage.theme === 'dark') return false;
    return lovePage.recipientType === 'LOVER' || lovePage.recipientType === 'SPOUSE' || !lovePage.recipientType;
  }, [themeConfig, lovePage]);

  const getEnvelopeLabel = (type?: string) => {
    switch (type) {
      case 'MOTHER': return 'Gửi Mẹ kính yêu 👩';
      case 'FATHER': return 'Gửi Cha kính yêu 👨';
      case 'GRANDPARENT': return 'Kính gửi Ông Bà 👵';
      case 'TEACHER': return 'Tri ân Thầy Cô 🎓';
      case 'FAMILY': return 'Gửi cả gia đình ❤️';
      case 'FRIEND': return 'Gửi bạn thân thiết 👭';
      case 'CHILD': return 'Gửi con yêu thương 👶';
      case 'OTHER': return 'Gửi lời thương mến ✨';
      default: return 'Gửi người thương ❤️';
    }
  };

  const getSignOffText = (type?: string) => {
    switch (type) {
      case 'MOTHER':
      case 'FATHER':
      case 'GRANDPARENT':
      case 'FAMILY':
        return 'Con của bố mẹ ❤️';
      case 'TEACHER':
        return 'Học trò kính chúc 💐';
      case 'FRIEND':
        return 'Mãi là bạn tốt 👭';
      case 'CHILD':
        return 'Bố mẹ yêu con ❤️';
      default:
        return 'Thương mến ❤️';
    }
  };



  const handleExit = () => {
    window.close();
    setTimeout(() => {
      window.location.href = 'about:blank';
    }, 100);
  };

  const heartsArray = useMemo(() => {
    if (!endingActive) return [];
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 6,
      duration: Math.random() * 4 + 3,
      size: Math.random() * 20 + 10,
      opacity: Math.random() * 0.6 + 0.4,
      rotation: Math.random() * 60 - 30,
    }));
  }, [endingActive]);

  const galleryImages = useMemo(() => {
    if (!lovePageData) return [];
    const messages = lovePageData.content.messages || [];
    const images = lovePageData.content.images || [];
    const storyChapters = messages.slice(1, -1);
    return images.slice(storyChapters.length);
  }, [lovePageData]);

  // Audio setup
  useEffect(() => {
    if (loading) return;

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
  }, [loading, music, currentMusic, playMusic, pauseMusic]);

  // Open envelope
  const handleEnvelopeClick = () => {
    if (envelopeOpen) return;
    setEnvelopeOpen(true);
    // After 1.3s opening animation, expand to fullscreen modal
    setTimeout(() => {
      setLetterExpanded(true);
    }, 1300);
  };

  // Close letter and go back to admiring the garden
  const handleAdmireGarden = () => {
    setLetterExpanded(false);
    // Wait for scaling down transition, then close envelope
    setTimeout(() => {
      setEnvelopeOpen(false);
      setShowEnvelope(false);
    }, 600);
  };

  // Finish experience
  const handleFinish = () => {
    setLetterExpanded(false);
    setTimeout(() => {
      setEndingActive(true);
    }, 500);
  };

  if (!slug) {
    return <div className="p-8 text-center text-error">Đường dẫn không hợp lệ.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#160016]">
        <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
        <span className="mt-4 font-handwriting text-lg text-primary">Đang chuẩn bị thư gửi...</span>
      </div>
    );
  }

  if (error || !lovePage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#160016]">
        <p className="font-handwriting text-xl text-primary">{error || 'Không có dữ liệu.'}</p>
      </div>
    );
  }

  return (
    <div className={`letter-page-container ${loaded ? '' : 'not-loaded'} ${isLoverStyle ? '' : 'non-lover'}`}>
      <style>
        {`
          .letter-page-container.non-lover {
            background: linear-gradient(to bottom, #fff5f7, #ffe3e9) !important;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .letter-page-container.non-lover .flowers,
          .letter-page-container.non-lover .night {
            display: none !important;
          }
          .letter-page-container.non-lover .envelope-backdrop {
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent !important;
            position: absolute;
            inset: 0;
          }
          .letter-page-container.non-lover .envelope-wrapper {
            margin-top: 0 !important;
          }
          .letter-page-container.non-lover .floating-envelope-btn {
            background-color: var(--theme-primary, #ff5e9c) !important;
          }
          .letter-page-container.non-lover .ending-title {
            color: var(--theme-primary, #ff5e9c) !important;
          }
        `}
      </style>

      {/* Warm light particles bokeh for families */}
      {!isLoverStyle && <ParticleBackground type="light" primaryColor="#ff8fab" />}

      {/* Night Sky Background */}
      <div className="night"></div>

      {/* Blossoming Flowers Scene */}
      <div className="flowers">
        {/* Flower 1 */}
        <div className="flower flower--1">
          <div className="flower__leafs flower__leafs--1">
            <div className="flower__leaf flower__leaf--1"></div>
            <div className="flower__leaf flower__leaf--2"></div>
            <div className="flower__leaf flower__leaf--3"></div>
            <div className="flower__leaf flower__leaf--4"></div>
            <div className="flower__white-circle"></div>

            <div className="flower__light flower__light--1"></div>
            <div className="flower__light flower__light--2"></div>
            <div className="flower__light flower__light--3"></div>
            <div className="flower__light flower__light--4"></div>
            <div className="flower__light flower__light--5"></div>
            <div className="flower__light flower__light--6"></div>
            <div className="flower__light flower__light--7"></div>
            <div className="flower__light flower__light--8"></div>
          </div>
          <div className="flower__line">
            <div className="flower__line__leaf flower__line__leaf--1"></div>
            <div className="flower__line__leaf flower__line__leaf--2"></div>
            <div className="flower__line__leaf flower__line__leaf--3"></div>
            <div className="flower__line__leaf flower__line__leaf--4"></div>
            <div className="flower__line__leaf flower__line__leaf--5"></div>
            <div className="flower__line__leaf flower__line__leaf--6"></div>
          </div>
        </div>

        {/* Flower 2 */}
        <div className="flower flower--2">
          <div className="flower__leafs flower__leafs--2">
            <div className="flower__leaf flower__leaf--1"></div>
            <div className="flower__leaf flower__leaf--2"></div>
            <div className="flower__leaf flower__leaf--3"></div>
            <div className="flower__leaf flower__leaf--4"></div>
            <div className="flower__white-circle"></div>

            <div className="flower__light flower__light--1"></div>
            <div className="flower__light flower__light--2"></div>
            <div className="flower__light flower__light--3"></div>
            <div className="flower__light flower__light--4"></div>
            <div className="flower__light flower__light--5"></div>
            <div className="flower__light flower__light--6"></div>
            <div className="flower__light flower__light--7"></div>
            <div className="flower__light flower__light--8"></div>
          </div>
          <div className="flower__line">
            <div className="flower__line__leaf flower__line__leaf--1"></div>
            <div className="flower__line__leaf flower__line__leaf--2"></div>
            <div className="flower__line__leaf flower__line__leaf--3"></div>
            <div className="flower__line__leaf flower__line__leaf--4"></div>
          </div>
        </div>

        {/* Flower 3 */}
        <div className="flower flower--3">
          <div className="flower__leafs flower__leafs--3">
            <div className="flower__leaf flower__leaf--1"></div>
            <div className="flower__leaf flower__leaf--2"></div>
            <div className="flower__leaf flower__leaf--3"></div>
            <div className="flower__leaf flower__leaf--4"></div>
            <div className="flower__white-circle"></div>

            <div className="flower__light flower__light--1"></div>
            <div className="flower__light flower__light--2"></div>
            <div className="flower__light flower__light--3"></div>
            <div className="flower__light flower__light--4"></div>
            <div className="flower__light flower__light--5"></div>
            <div className="flower__light flower__light--6"></div>
            <div className="flower__light flower__light--7"></div>
            <div className="flower__light flower__light--8"></div>
          </div>
          <div className="flower__line">
            <div className="flower__line__leaf flower__line__leaf--1"></div>
            <div className="flower__line__leaf flower__line__leaf--2"></div>
            <div className="flower__line__leaf flower__line__leaf--3"></div>
            <div className="flower__line__leaf flower__line__leaf--4"></div>
          </div>
        </div>

        <div className="grow-ans" style={{ '--d': '1.2s' } as React.CSSProperties}>
          <div className="flower__g-long">
            <div className="flower__g-long__top"></div>
            <div className="flower__g-long__bottom"></div>
          </div>
        </div>

        <div className="growing-grass">
          <div className="flower__grass flower__grass--1">
            <div className="flower__grass--top"></div>
            <div className="flower__grass--bottom"></div>
            <div className="flower__grass__leaf flower__grass__leaf--1"></div>
            <div className="flower__grass__leaf flower__grass__leaf--2"></div>
            <div className="flower__grass__leaf flower__grass__leaf--3"></div>
            <div className="flower__grass__leaf flower__grass__leaf--4"></div>
            <div className="flower__grass__leaf flower__grass__leaf--5"></div>
            <div className="flower__grass__leaf flower__grass__leaf--6"></div>
            <div className="flower__grass__leaf flower__grass__leaf--7"></div>
            <div className="flower__grass__leaf flower__grass__leaf--8"></div>
            <div className="flower__grass__overlay"></div>
          </div>
        </div>

        <div className="growing-grass">
          <div className="flower__grass flower__grass--2">
            <div className="flower__grass--top"></div>
            <div className="flower__grass--bottom"></div>
            <div className="flower__grass__leaf flower__grass__leaf--1"></div>
            <div className="flower__grass__leaf flower__grass__leaf--2"></div>
            <div className="flower__grass__leaf flower__grass__leaf--3"></div>
            <div className="flower__grass__leaf flower__grass__leaf--4"></div>
            <div className="flower__grass__leaf flower__grass__leaf--5"></div>
            <div className="flower__grass__leaf flower__grass__leaf--6"></div>
            <div className="flower__grass__leaf flower__grass__leaf--7"></div>
            <div className="flower__grass__leaf flower__grass__leaf--8"></div>
            <div className="flower__grass__overlay"></div>
          </div>
        </div>

        <div className="grow-ans" style={{ '--d': '2.4s' } as React.CSSProperties}>
          <div className="flower__g-right flower__g-right--1">
            <div className="leaf"></div>
          </div>
        </div>

        <div className="grow-ans" style={{ '--d': '2.8s' } as React.CSSProperties}>
          <div className="flower__g-right flower__g-right--2">
            <div className="leaf"></div>
          </div>
        </div>

        <div className="grow-ans" style={{ '--d': '2.8s' } as React.CSSProperties}>
          <div className="flower__g-front">
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--1">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--2">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--3">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--4">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--5">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--6">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--7">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--8">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__line"></div>
          </div>
        </div>

        <div className="grow-ans" style={{ '--d': '3.2s' } as React.CSSProperties}>
          <div className="flower__g-fr">
            <div className="leaf"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--1"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--2"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--3"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--4"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--5"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--6"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--7"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--8"></div>
          </div>
        </div>

        {/* Grass collections */}
        <div className="long-g long-g--0">
          <div className="grow-ans" style={{ '--d': '3s' } as React.CSSProperties}>
            <div className="leaf leaf--0"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '2.2s' } as React.CSSProperties}>
            <div className="leaf leaf--1"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '3.4s' } as React.CSSProperties}>
            <div className="leaf leaf--2"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '3.6s' } as React.CSSProperties}>
            <div className="leaf leaf--3"></div>
          </div>
        </div>

        <div className="long-g long-g--1">
          <div className="grow-ans" style={{ '--d': '3.6s' } as React.CSSProperties}>
            <div className="leaf leaf--0"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '3.8s' } as React.CSSProperties}>
            <div className="leaf leaf--1"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '4s' } as React.CSSProperties}>
            <div className="leaf leaf--2"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '4.2s' } as React.CSSProperties}>
            <div className="leaf leaf--3"></div>
          </div>
        </div>

        <div className="long-g long-g--2">
          <div className="grow-ans" style={{ '--d': '4s' } as React.CSSProperties}>
            <div className="leaf leaf--0"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '4.2s' } as React.CSSProperties}>
            <div className="leaf leaf--1"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '4.4s' } as React.CSSProperties}>
            <div className="leaf leaf--2"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '4.6s' } as React.CSSProperties}>
            <div className="leaf leaf--3"></div>
          </div>
        </div>

        <div className="long-g long-g--3">
          <div className="grow-ans" style={{ '--d': '4s' } as React.CSSProperties}>
            <div className="leaf leaf--0"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '4.2s' } as React.CSSProperties}>
            <div className="leaf leaf--1"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '3s' } as React.CSSProperties}>
            <div className="leaf leaf--2"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '3.6s' } as React.CSSProperties}>
            <div className="leaf leaf--3"></div>
          </div>
        </div>

        <div className="long-g long-g--4">
          <div className="grow-ans" style={{ '--d': '4s' } as React.CSSProperties}>
            <div className="leaf leaf--0"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '4.2s' } as React.CSSProperties}>
            <div className="leaf leaf--1"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '3s' } as React.CSSProperties}>
            <div className="leaf leaf--2"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '3.6s' } as React.CSSProperties}>
            <div className="leaf leaf--3"></div>
          </div>
        </div>

        <div className="long-g long-g--5">
          <div className="grow-ans" style={{ '--d': '4s' } as React.CSSProperties}>
            <div className="leaf leaf--0"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '4.2s' } as React.CSSProperties}>
            <div className="leaf leaf--1"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '3s' } as React.CSSProperties}>
            <div className="leaf leaf--2"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '3.6s' } as React.CSSProperties}>
            <div className="leaf leaf--3"></div>
          </div>
        </div>

        <div className="long-g long-g--6">
          <div className="grow-ans" style={{ '--d': '4.2s' } as React.CSSProperties}>
            <div className="leaf leaf--0"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '4.4s' } as React.CSSProperties}>
            <div className="leaf leaf--1"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '4.6s' } as React.CSSProperties}>
            <div className="leaf leaf--2"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '4.8s' } as React.CSSProperties}>
            <div className="leaf leaf--3"></div>
          </div>
        </div>

        <div className="long-g long-g--7">
          <div className="grow-ans" style={{ '--d': '3s' } as React.CSSProperties}>
            <div className="leaf leaf--0"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '3.2s' } as React.CSSProperties}>
            <div className="leaf leaf--1"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '3.5s' } as React.CSSProperties}>
            <div className="leaf leaf--2"></div>
          </div>
          <div className="grow-ans" style={{ '--d': '3.6s' } as React.CSSProperties}>
            <div className="leaf leaf--3"></div>
          </div>
        </div>
      </div>

      {/* Back button (Only visible if ending screen is not active) */}
      {!endingActive && (
        <button
          onClick={() => {
            if (galleryImages.length > 0) {
              navigate(`/page/${slug}/gallery`);
            } else {
              navigate(`/page/${slug}`);
            }
          }}
          className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/80 hover:text-white hover:bg-white/20 transition-all font-label-caps text-label-caps shadow-md"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span>Quay lại</span>
        </button>
      )}

      {/* 3D Envelope Backdrop Modal */}
      <div className={`envelope-backdrop ${showEnvelope && !endingActive ? 'active' : ''}`}>
        <div
          onClick={handleEnvelopeClick}
          className={`envelope-wrapper ${envelopeOpen ? 'open' : ''}`}
        >
          <div className="envelope-pocket"></div>
          <div className="envelope-left"></div>
          <div className="envelope-right"></div>
          <div className="envelope-bottom"></div>
          <div className="envelope-flap"></div>
          <div className="envelope-letter">
            <span className="material-symbols-outlined letter-heart">favorite</span>
            <span className="letter-label">{getEnvelopeLabel(lovePage?.recipientType)}</span>
          </div>
        </div>
      </div>

      {/* Fullscreen Expanded Letter Overlay */}
      <div className={`letter-expanded-overlay ${letterExpanded ? 'active' : ''}`}>
        <div className="letter-expanded-card relative z-10 text-white">
          {/* Scrollable Letter Content */}
          <div className="letter-scroll-content flex-1 overflow-y-auto pr-2 mb-6">
            <span className="material-symbols-outlined text-primary text-4xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
            <div className="font-handwriting text-2xl md:text-3xl leading-relaxed mb-6">
              {lastMessage}
            </div>

            <div className="text-right mb-2">
              <p className="font-label-caps text-label-caps text-primary tracking-widest uppercase font-semibold">
                {getSignOffText(lovePage?.recipientType)}
              </p>
            </div>
          </div>

          {/* Letter Buttons: Kết thúc & Ngắm vườn hoa */}
          <div className="flex gap-3 md:gap-4 border-t border-white/10 pt-6">
            <button
              onClick={handleAdmireGarden}
              className="flex-1 py-2.5 md:py-3 px-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm md:text-base font-semibold transition-all text-center whitespace-nowrap flex items-center justify-center"
            >
              Ngắm cảnh ✨
            </button>
            <button
              onClick={handleFinish}
              className="flex-1 py-2.5 md:py-3 px-3 rounded-full bg-primary hover:bg-primary/95 text-white text-sm md:text-base font-semibold transition-all shadow-[0_0_15px_rgba(178,30,97,0.4)] text-center whitespace-nowrap flex items-center justify-center"
            >
              Kết thúc ❤️
            </button>
          </div>
        </div>
      </div>

      {/* Floating Read Letter button when envelope is closed/hidden */}
      {!showEnvelope && loaded && !endingActive && (
        <button
          onClick={() => {
            setShowEnvelope(true);
            // Auto open the envelope and expand it
            setTimeout(() => {
              setEnvelopeOpen(true);
              setTimeout(() => {
                setLetterExpanded(true);
              }, 1300);
            }, 300);
          }}
          className="floating-envelope-btn"
        >
          <span className="material-symbols-outlined">mail</span>
        </button>
      )}

      {/* Final Ending Screen Backdrop Overlay */}
      <div className={`ending-backdrop-overlay ${endingActive ? 'active' : ''}`}>
        {/* Falling Heart Rain (Storm) Effect */}
        {endingActive && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <style>{`
              @keyframes heart-fall {
                0% {
                  transform: translateY(0) rotate(0deg) scale(0.7);
                  opacity: 0;
                }
                10% {
                  opacity: var(--op);
                }
                90% {
                  opacity: var(--op);
                }
                100% {
                  transform: translateY(105vh) rotate(var(--rot)) scale(1.2);
                  opacity: 0;
                }
              }
            `}</style>
            {heartsArray.map((heart) => (
              <span
                key={heart.id}
                className="material-symbols-outlined absolute text-primary"
                style={{
                  left: `${heart.left}%`,
                  animation: `heart-fall ${heart.duration}s linear ${heart.delay}s infinite`,
                  fontSize: `${heart.size}px`,
                  top: '-50px',
                  fontVariationSettings: "'FILL' 1",
                  ['--op' as any]: heart.opacity,
                  ['--rot' as any]: `${heart.rotation}deg`,
                }}
              >
                favorite
              </span>
            ))}
          </div>
        )}

        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center pointer-events-auto">
          <h1 className="ending-title font-handwriting">Mãi Yêu Thương ❤️</h1>
          <div className="flex justify-center gap-4 mb-8">
            <span className="material-symbols-outlined text-primary text-6xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            <span className="material-symbols-outlined text-primary text-6xl animate-pulse [animation-delay:200ms]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            <span className="material-symbols-outlined text-primary text-6xl animate-pulse [animation-delay:400ms]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          </div>
          <p className="text-white/80 font-body-lg text-center max-w-md leading-relaxed mb-8">
            Kỷ niệm đẹp đẽ này sẽ luôn được nâng niu và lưu giữ trọn vẹn trong góc yêu thương của chúng ta. ✨
          </p>
          <button
            onClick={handleExit}
            className="px-8 py-3 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold transition-all shadow-[0_0_20px_rgba(178,30,97,0.5)] active:scale-95"
          >
            Kết thúc
          </button>
        </div>
      </div>

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
            <div className="bg-[#16213e]/90 backdrop-blur-md dreamy-shadow rounded-full px-6 py-3 flex items-center justify-between gap-4 border border-white/10 relative overflow-hidden shadow-lg max-w-xs text-white">
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
                  <p className="font-caption text-[10px] text-white/60 truncate uppercase tracking-tighter pointer-events-none">Kỷ niệm của chúng ta</p>
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
    </div>
  );
};

export default LetterPage;
