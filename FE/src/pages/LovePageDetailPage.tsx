import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { LovePage } from '../types';
import { PinUnlockScreen } from '../features/love-page/PinUnlockScreen';
import { LovePageView } from '../features/love-page/LovePageView';

export const LovePageDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [pinToken, setPinToken] = useState<string | null>(null);
  const [lovePage, setLovePage] = useState<LovePage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        } else {
          setError('Không tìm thấy nội dung trang.');
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
  }, [slug, pinToken]);

  const handleUnlock = (token: string) => {
    if (slug) {
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

  // If unlocked, show the page
  if (pinToken && lovePage) {
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
