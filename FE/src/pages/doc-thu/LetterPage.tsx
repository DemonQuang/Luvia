import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { LovePage, Theme } from '../../types';
import { ParticleBackground } from '../../components/ui/ParticleBackground';
import { FloatingMusicPlayer } from '../../components/common/FloatingMusicPlayer';
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
  const music = content?.music || themeConfig?.defaultMusic || '';
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
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50 flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 hover:text-white hover:bg-white/20 transition-all font-label-caps text-[11px] sm:text-xs shadow-md active:scale-95"
        >
          <span className="material-symbols-outlined text-base sm:text-lg">arrow_back</span>
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
        <div className="letter-expanded-card relative z-10">
          {/* Decorative Letter Header */}
          <div className="flex items-center justify-between border-b border-rose-200/70 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c4286d] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
              </span>
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-[#8a224d]">
                Thư gửi {lovePage?.title || 'người thương'}
              </span>
            </div>
            <span className="text-[11px] sm:text-xs text-stone-500 italic">
              {new Date().toLocaleDateString('vi-VN')}
            </span>
          </div>

          {/* Scrollable Letter Content with High-readability gentle typography */}
          <div className="letter-scroll-content flex-1 overflow-y-auto pr-2 mb-4 select-text">
            <div className="letter-body-text text-base sm:text-lg leading-loose whitespace-pre-line break-words mb-6 text-left">
              {lastMessage}
            </div>

            <div className="text-right border-t border-rose-100 pt-3.5 mb-1">
              <p className="text-xs sm:text-sm text-[#9c2457] font-semibold tracking-wider">
                {getSignOffText(lovePage?.recipientType)}
              </p>
            </div>
          </div>

          {/* Letter Buttons: Kết thúc & Ngắm cảnh */}
          <div className="flex gap-3 sm:gap-4 border-t border-rose-200/70 pt-4">
            <button
              onClick={handleAdmireGarden}
              className="flex-1 py-2.5 sm:py-3 px-3 rounded-full bg-[#fff0f4] hover:bg-[#ffe5ec] border border-rose-200/80 text-[#9c2457] text-xs sm:text-sm font-semibold transition-all text-center whitespace-nowrap flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
            >
              Ngắm cảnh ✨
            </button>
            <button
              onClick={handleFinish}
              className="flex-1 py-2.5 sm:py-3 px-3 rounded-full bg-gradient-to-r from-[#c4286d] to-[#9c1852] hover:opacity-95 text-white text-xs sm:text-sm font-semibold transition-all shadow-[0_4px_16px_rgba(196,40,109,0.35)] text-center whitespace-nowrap flex items-center justify-center cursor-pointer active:scale-95"
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

      {/* Synchronized Floating Music Player */}
      <FloatingMusicPlayer music={music} isDark={isLoverStyle} />
    </div>
  );
};

export default LetterPage;
