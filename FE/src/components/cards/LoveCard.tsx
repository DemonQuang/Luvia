import React from 'react';
import { Link } from 'react-router-dom';
import { LovePage } from '../../types';

interface LoveCardProps {
  page: LovePage;
  onDelete: (id: string) => void;
}

export const LoveCard: React.FC<LoveCardProps> = ({ page, onDelete }) => {
  const firstImage = page.content.images && page.content.images.length > 0
    ? page.content.images[0]
    : '';

  // Get full link to love page
  const pageUrl = `/page/${page.slug}`;

  // Helper to format date
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="glass-panel rounded-3xl overflow-hidden dreamy-shadow hover:scale-[1.02] transition-all duration-300 flex flex-col h-full">
      {/* Cover Image */}
      <div className="relative aspect-[16/10] bg-gradient-to-tr from-secondary-container/20 to-primary-container/20 overflow-hidden">
        {firstImage ? (
          <img
            src={firstImage}
            alt={page.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-primary-container">
            <span className="material-symbols-outlined text-4xl mb-2">favorite</span>
            <span className="font-caption text-xs uppercase tracking-widest">Kỷ niệm ngọt ngào</span>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-surface/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-1 border border-white/20">
          <span className="material-symbols-outlined text-sm text-primary">visibility</span>
          <span className="text-xs font-semibold text-on-surface-variant">{page.views}</span>
        </div>
        <div className="absolute top-4 left-4 bg-primary text-on-primary text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">
          Theme: {page.theme}
        </div>
      </div>

      {/* Info Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-h3 text-h3 text-on-surface line-clamp-1 mb-1">{page.title}</h3>
          <p className="font-caption text-xs text-on-surface-variant mb-4">
            Tạo ngày: {formatDate(page.createdAt)}
          </p>

          <div className="bg-surface-container-low px-4 py-3 rounded-2xl flex justify-between items-center mb-6">
            <div>
              <span className="text-xs text-on-surface-variant block">Đường dẫn</span>
              <code className="text-sm text-primary font-mono font-bold">/{page.slug}</code>
            </div>
            <button
              onClick={() => {
                const fullLink = `${window.location.origin}/page/${page.slug}`;
                navigator.clipboard.writeText(fullLink);
                alert('Đã sao chép liên kết vào bộ nhớ tạm!');
              }}
              className="text-on-surface-variant hover:text-primary p-2 hover:bg-surface-container-high rounded-full transition-all"
              title="Sao chép liên kết"
            >
              <span className="material-symbols-outlined text-lg">content_copy</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            to={pageUrl}
            target="_blank"
            className="flex-1 py-3 text-center bg-primary text-on-primary font-semibold text-xs rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            Xem trang
          </Link>
          
          <Link
            to={`/dashboard/edit/${page._id}`}
            className="p-3 bg-surface-container-high hover:bg-primary-container/20 text-on-surface-variant hover:text-primary rounded-xl transition-all"
            title="Chỉnh sửa trang"
          >
            <span className="material-symbols-outlined text-lg block">edit</span>
          </Link>

          <button
            onClick={() => onDelete(page._id)}
            className="p-3 bg-surface-container-high hover:bg-error-container/20 text-on-surface-variant hover:text-error rounded-xl transition-all"
            title="Xóa trang"
          >
            <span className="material-symbols-outlined text-lg block">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default LoveCard;
