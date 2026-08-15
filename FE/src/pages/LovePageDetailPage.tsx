import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { LovePage } from '../types';
import { PinUnlockScreen } from '../features/love-page/PinUnlockScreen';
import { LovePageView } from '../features/love-page/LovePageView';
import { SunflowerDuck } from '../components/ui/SunflowerDuck';

export const LovePageDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [pinToken, setPinToken] = useState<string | null>(null);
  const [lovePage, setLovePage] = useState<LovePage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Duck animation transition states
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);

  // Check if token exists in sessionStorage for this slug so refresh doesn't trigger lock again
  useEffect(() => {
    if (slug) {
      const storedToken = sessionStorage.getItem(`pin_token_${slug}`);
      if (storedToken) {
        setPinToken(storedToken);
      }
    }
  }, [slug]);

  // Load love page when pinToken changes
  useEffect(() => {
    if (!slug || !pinToken) return;

    const fetchPage = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.loves.getLovePageBySlug(slug, pinToken);
        if (res.success && res.data) {
          setLovePage(res.data);
          if (shouldAnimate) {
            setIsTransitioning(true);
          }
        } else {
          setError('Không tìm thấy nội dung trang.');
          setPinToken(null);
          sessionStorage.removeItem(`pin_token_${slug}`);
        }
      } catch (err: any) {
        // If token invalid/expired, clear it
        setError(err.message || 'Lỗi khi tải trang.');
        setPinToken(null);
        sessionStorage.removeItem(`pin_token_${slug}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug, pinToken, shouldAnimate]);

  // Duck progress animation logic using requestAnimationFrame
  useEffect(() => {
    if (!isTransitioning) return;

    setTransitionProgress(0);
    const duration = 2200; // 2.2 seconds
    const startTime = performance.now();
    let animFrameId: number;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setTransitionProgress(progress);

      if (progress < 100) {
        animFrameId = requestAnimationFrame(animate);
      } else {
        // Give a slight buffer for the duck to completely run off-screen
        setTimeout(() => {
          setIsTransitioning(false);
          setShouldAnimate(false);
        }, 150);
      }
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [isTransitioning]);

  const handleUnlock = (token: string) => {
    if (slug) {
      setShouldAnimate(true);
      sessionStorage.setItem(`pin_token_${slug}`, token);
      setPinToken(token);
    }
  };

  if (!slug) {
    return <div className="p-8 text-center text-error">Đường dẫn không hợp lệ.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
          <span className="font-caption text-on-surface-variant">Đang mở khóa kỷ niệm...</span>
        </div>
      </div>
    );
  }

  // If unlocked, show the page (with or without transition)
  if (pinToken && lovePage) {
    if (isTransitioning) {
      return (
        <div className="relative min-h-screen w-full overflow-hidden bg-background">
          {/* Layer 1: Static PinUnlockScreen (background, being covered) */}
          <div className="absolute inset-0 z-10 pointer-events-none select-none">
            <PinUnlockScreen slug={slug} onUnlock={() => {}} isStatic={true} />
          </div>

          {/* Layer 2: LovePageView (slide-in from left) */}
          <div
            className="absolute inset-0 z-20 overflow-hidden"
            style={{
              clipPath: `polygon(0 0, ${transitionProgress}% 0, ${transitionProgress}% 100%, 0 100%)`,
              WebkitClipPath: `polygon(0 0, ${transitionProgress}% 0, ${transitionProgress}% 100%, 0 100%)`,
            }}
          >
            <LovePageView page={lovePage} />
          </div>

          {/* Layer 3: Running Duck drawing the split divider */}
          <div
            className="fixed z-30 pointer-events-none"
            style={{
              left: `calc(${transitionProgress}% - 125px)`,
              bottom: '2%',
            }}
          >
            {/* Rope pulled by the duck to reveal the page */}
            <svg className="absolute overflow-visible" style={{ left: -325, top: 125, width: 450, height: 100 }}>
              <path
                d="M 450,10 Q 225,25 0,30"
                fill="none"
                stroke="#a77a3d"
                strokeWidth="5"
                strokeDasharray="10,7"
                strokeLinecap="round"
              />
            </svg>
            <div style={{ transform: 'scaleX(-1)' }}>
              <SunflowerDuck size={300} />
            </div>
          </div>
        </div>
      );
    }

    return <LovePageView page={lovePage} />;
  }

  // Otherwise, show PIN unlock screen
  return (
    <div>
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-error/90 text-white px-6 py-3 rounded-full text-xs font-semibold shadow-lg">
          {error}
        </div>
      )}
      <PinUnlockScreen slug={slug} onUnlock={handleUnlock} />
    </div>
  );
};
export default LovePageDetailPage;
