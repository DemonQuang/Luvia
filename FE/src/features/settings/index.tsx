import React from 'react';

export const SettingsFeature: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-h1 text-h1 text-on-surface mb-2 font-bold">Cài đặt hệ thống</h1>
        <p className="font-body-md text-on-surface-variant">Tùy chỉnh các cấu hình chung của bạn.</p>
      </div>

      <div className="glass-panel p-8 rounded-[2rem] space-y-6">
        <div className="space-y-4">
          <h3 className="font-h3 text-h3 text-on-surface border-b pb-2">Tùy chọn chung</h3>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold block text-on-surface">Giao diện tối</span>
              <span className="text-xs text-on-surface-variant">Kích hoạt chế độ nền tối cho bảng điều khiển</span>
            </div>
            <button
              onClick={() => alert('Chức năng đang được phát triển')}
              className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-semibold"
            >
              Kích hoạt
            </button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <span className="font-semibold block text-on-surface">Ngôn ngữ hiển thị</span>
              <span className="text-xs text-on-surface-variant">Chọn ngôn ngữ làm việc mặc định</span>
            </div>
            <span className="text-sm font-semibold text-primary">Tiếng Việt (VI)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsFeature;
