import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LovePage } from '../types';
import { CosmicGallery } from '../components/ui/CosmicGallery';

export const GalleryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [lovePage, setLovePage] = useState<LovePage | null>(null);
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

  const galleryImages = useMemo(() => {
    if (!lovePage) return [];
    const images = lovePage.content.images || [];
    const messages = lovePage.content.messages || [];
    const storyChapters = messages.slice(1, -1);
    return images.slice(storyChapters.length);
  }, [lovePage]);

  if (!slug) {
    return <div className="p-8 text-center text-error">Đường dẫn không hợp lệ.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#160016' }}>
        <span className="material-symbols-outlined text-4xl animate-spin" style={{ color: 'rgb(252, 24, 210)' }}>sync</span>
        <span className="mt-4 font-handwriting text-lg" style={{ color: 'rgb(252, 24, 210)' }}>Đang du hành vũ trụ...</span>
      </div>
    );
  }

  if (error || !lovePage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#160016' }}>
        <p className="font-handwriting text-xl" style={{ color: 'rgb(252, 24, 210)' }}>{error || 'Không có dữ liệu.'}</p>
      </div>
    );
  }

  const handleNext = () => {
    navigate(`/page/${slug}/letter`);
  };

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: '#160016' }}>
      <CosmicGallery
        images={galleryImages}
        title={lovePage.content.recipient || lovePage.title}
        music={lovePage.content.music}
        onNext={handleNext}
        onBack={() => navigate(`/page/${slug}`)}
      />
    </div>
  );
};

export default GalleryPage;
