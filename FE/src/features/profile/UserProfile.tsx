import React from 'react';
import { useAuth } from '../../store/auth.store';

export const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-h1 text-h1 text-on-surface mb-2">Thông tin cá nhân</h1>
        <p className="font-body-md text-on-surface-variant">Xem và quản lý thông tin tài khoản Luvia của bạn.</p>
      </div>

      <div className="glass-panel p-8 rounded-[2rem] dreamy-shadow space-y-6">
        {/* User Card Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-secondary-container/10">
          <div className="w-20 h-20 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-3xl shadow-md">
            {user.fullname.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h2 className="font-h2 text-h2 text-on-surface font-bold">{user.fullname}</h2>
            <p className="font-caption text-on-surface-variant">@{user.username}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-150 text-yellow-800 rounded-full text-xs font-semibold border border-yellow-200">
              <span className="material-symbols-outlined text-sm text-yellow-600">workspace_premium</span>
              Thành viên Premium
            </div>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="font-label-caps text-label-caps text-on-surface-variant block uppercase tracking-wider">Họ và tên</span>
            <p className="font-body-md text-on-surface font-medium">{user.fullname}</p>
          </div>

          <div className="space-y-1">
            <span className="font-label-caps text-label-caps text-on-surface-variant block uppercase tracking-wider">Tên tài khoản</span>
            <p className="font-body-md text-on-surface font-medium">@{user.username}</p>
          </div>

          <div className="space-y-1">
            <span className="font-label-caps text-label-caps text-on-surface-variant block uppercase tracking-wider">Địa chỉ Email</span>
            <p className="font-body-md text-on-surface font-medium">{user.email}</p>
          </div>

          <div className="space-y-1">
            <span className="font-label-caps text-label-caps text-on-surface-variant block uppercase tracking-wider">Vai trò hệ thống</span>
            <p className="font-body-md text-on-surface font-medium capitalize">{user.role}</p>
          </div>
        </div>

        <div className="pt-6 border-t border-secondary-container/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            onClick={() => alert('Chức năng cập nhật thông tin đang được cập nhật.')}
            className="w-full sm:w-auto bg-primary text-on-primary px-6 py-3.5 font-semibold text-sm rounded-xl hover:opacity-95 transition-all shadow-md"
          >
            Chỉnh sửa thông tin
          </button>
          
          <button
            onClick={logout}
            className="w-full sm:w-auto border border-error/20 text-error hover:bg-error-container/20 px-6 py-3.5 font-semibold text-sm rounded-xl transition-all"
          >
            Đăng xuất tài khoản
          </button>
        </div>
      </div>
    </div>
  );
};
export default UserProfile;
