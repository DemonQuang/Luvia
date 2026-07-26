import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { LovePage } from '../../types';
import StatsCard from '../../components/cards/StatsCard';
import LoveCard from '../../components/cards/LoveCard';

export const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<LovePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await api.loves.getLoves();
      if (response.success && response.data) {
        setPages(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể lấy danh sách trang tỏ tình.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa trang kỷ niệm này không? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      const response = await api.loves.deleteLove(id);
      if (response.success) {
        setPages(pages.filter(p => p._id !== id));
        alert('Đã xóa trang kỷ niệm thành công.');
      }
    } catch (err: any) {
      alert(err.message || 'Xóa trang thất bại.');
    }
  };

  // Compute stats
  const totalPages = pages.length;
  const totalViews = pages.reduce((sum, p) => sum + (p.views || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
        <p className="text-on-surface-variant font-caption mt-4">Đang tải danh sách trang kỷ niệm...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface mb-2">Không gian của bạn</h1>
          <p className="font-body-md text-on-surface-variant">Lưu trữ và theo dõi các trang kỷ niệm tình yêu.</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/create')}
          className="bg-primary text-on-primary rounded-xl px-6 py-3.5 font-h3 shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 primary-shine dreamy-shadow"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Tạo trang mới
        </button>
      </div>

      {error && (
        <div className="bg-error-container/30 border border-error/20 text-error p-4 rounded-xl text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatsCard
          title="Tổng số trang"
          value={totalPages}
          icon="favorite"
          color="text-primary"
        />
        <StatsCard
          title="Tổng lượt xem"
          value={totalViews}
          icon="visibility"
          color="text-secondary"
        />
        <StatsCard
          title="Gói dịch vụ"
          value="Premium"
          icon="workspace_premium"
          color="text-yellow-600"
          trend="Hoạt động trọn đời"
        />
      </div>

      {/* Love Pages Grid */}
      <div className="space-y-6">
        <h2 className="font-h2 text-h2 text-on-surface">Danh sách trang kỷ niệm</h2>
        {pages.length === 0 ? (
          <div className="glass-panel p-12 rounded-[2rem] text-center max-w-xl mx-auto space-y-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-float">
              <span className="material-symbols-outlined text-3xl">favorite</span>
            </div>
            <div className="space-y-2">
              <h3 className="font-h3 text-h3 text-on-surface">Chưa có trang kỷ niệm nào</h3>
              <p className="font-body-md text-on-surface-variant">
                Bắt đầu viết câu chuyện tình yêu lãng mạn của hai bạn bằng cách tạo một trang tỏ tình độc đáo.
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/create')}
              className="bg-primary text-on-primary rounded-xl px-6 py-3.5 font-semibold text-sm shadow-md hover:opacity-90 transition-all"
            >
              Tạo câu chuyện đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {pages.map((page) => (
              <div key={page._id}>
                <LoveCard page={page} onDelete={handleDelete} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => navigate('/dashboard/create')}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-on-primary shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center md:hidden z-40 dreamy-shadow"
        title="Tạo trang mới"
      >
        <span className="material-symbols-outlined text-2xl font-bold">add</span>
      </button>
    </div>
  );
};
export default DashboardOverview;
