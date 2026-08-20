import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { LovePage, Theme } from '../../types';
import { CosmicGallery } from './CosmicGallery';
import { PolaroidGallery } from './PolaroidGallery';

export const GalleryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [lovePage, setLovePage] = useState<LovePage | null>(null);
  const [themeConfig, setThemeConfig] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        console.error("Error loading theme config in Gallery:", e);
      }
    };
    fetchTheme();
  }, [lovePage]);

  const galleryImages = useMemo(() => {
    if (!lovePage) return [];
    const images = lovePage.content.images || [];
    const messages = lovePage.content.messages || [];
    const storyChapters = messages.slice(1, -1);
    return images.slice(storyChapters.length);
  }, [lovePage]);

  const galleryLayout = useMemo(() => {
    if (themeConfig && themeConfig.galleryLayout) {
      return themeConfig.galleryLayout;
    }
    // Fallback logic
    const isLoverType = !lovePage || lovePage.recipientType === 'LOVER' || lovePage.recipientType === 'SPOUSE';
    if (lovePage?.theme === 'romantic') return 'cosmic';
    if (lovePage?.theme === 'cute' || lovePage?.theme === 'dark') return 'polaroid';
    return isLoverType ? 'cosmic' : 'polaroid';
  }, [themeConfig, lovePage]);

  if (!slug) {
    return <div className="p-8 text-center text-error">Đường dẫn không hợp lệ.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#160016]">
        <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
        <span className="mt-4 font-handwriting text-lg text-primary">Đang tải kỷ niệm...</span>
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

  const handleNext = () => {
    navigate(`/page/${slug}/letter`);
  };

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: galleryLayout === 'cosmic' ? '#160016' : undefined }}>
      {galleryLayout === 'cosmic' ? (
        <CosmicGallery
          images={galleryImages}
          title={lovePage.content.recipient || lovePage.title}
          music={lovePage.content.music || themeConfig?.defaultMusic || ''}
          onNext={handleNext}
          onBack={() => navigate(`/page/${slug}`)}
        />
      ) : (
        <PolaroidGallery
          images={galleryImages}
          title={lovePage.content.recipient || lovePage.title}
          music={lovePage.content.music || themeConfig?.defaultMusic || ''}
          onNext={handleNext}
          onBack={() => navigate(`/page/${slug}`)}
        />
      )}
    </div>
  );
};

export default GalleryPage;
