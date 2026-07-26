import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/auth.store';
import { useAppState } from '../../store/app.store';

export const AdminLayout: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const { isSidebarOpen, setIsSidebarOpen } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (user.role !== 'admin') {
        navigate('/dashboard');
      }
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">shield_person</span>
          <span className="font-caption text-on-surface-variant">Đang kiểm tra quyền truy cập admin...</span>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      name: 'Quản lý người dùng',
      icon: 'group',
      path: '/admin',
    },
    {
      name: 'Quay lại Bảng điều khiển',
      icon: 'dashboard',
      path: '/dashboard',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-inverse-surface text-inverse-on-surface p-6 z-30">
        <div className="mb-8 flex items-center space-x-2">
          <span className="material-symbols-outlined text-primary-fixed-dim text-3xl font-bold">admin_panel_settings</span>
          <span className="font-display text-h3 text-white font-bold tracking-tight">Luvia Admin</span>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-on-primary font-semibold translate-x-1'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-body-md">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-gray-800">
          <div className="flex items-center space-x-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">
              A
            </div>
            <div>
              <p className="font-caption font-semibold text-white truncate max-w-[140px]">
                {user.fullname}
              </p>
              <p className="text-xs text-gray-400 truncate max-w-[140px]">
                Admin @{user.username}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-950/40 transition-all font-semibold"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body-md">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-inverse-surface text-inverse-on-surface p-6 h-full">
            <div className="mb-8 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-primary-fixed-dim text-2xl font-bold">admin_panel_settings</span>
                <span className="font-display text-h3 text-white font-bold tracking-tight">Luvia Admin</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <nav className="flex-1 space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-primary text-on-primary font-semibold'
                        : 'text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span className="font-body-md">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-6 border-t border-gray-800">
              <div className="flex items-center space-x-3 mb-6 px-2">
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">
                  A
                </div>
                <div>
                  <p className="font-caption font-semibold text-white truncate">{user.fullname}</p>
                  <p className="text-xs text-gray-400 truncate">Admin @{user.username}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  logout();
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-950/40 transition-all font-semibold"
              >
                <span className="material-symbols-outlined">logout</span>
                <span className="font-body-md">Đăng xuất</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content wrapper */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="flex md:hidden items-center justify-between px-6 py-4 bg-inverse-surface text-inverse-on-surface">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-primary-fixed-dim text-xl font-bold">admin_panel_settings</span>
            <span className="font-display text-h3 text-white font-bold">Luvia Admin</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400 p-2 hover:text-white">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>

        {/* Admin Main Content */}
        <main className="flex-grow p-6 md:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default AdminLayout;
