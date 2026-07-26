import React from 'react';

export const NotificationFeature: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-h1 text-h1 text-on-surface mb-2 font-bold">Thông báo</h1>
        <p className="font-body-md text-on-surface-variant">Xem các cập nhật mới nhất về hệ thống và hoạt động của bạn.</p>
      </div>

      <div className="glass-panel p-8 rounded-[2rem] text-center max-w-lg mx-auto space-y-4 py-16">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto animate-float">
          <span className="material-symbols-outlined text-3xl">notifications</span>
        </div>
        <div>
          <h3 className="font-h3 text-h3 text-on-surface">Không có thông báo mới</h3>
          <p className="font-body-md text-on-surface-variant text-sm mt-1">Chúng tôi sẽ thông báo cho bạn khi có tin tức mới hoặc lượt xem đặc biệt.</p>
        </div>
      </div>
    </div>
  );
};
export default NotificationFeature;
