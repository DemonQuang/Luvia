import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/auth.store';
import { useAppState } from '../../store/app.store';

export const DashboardLayout: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const { isSidebarOpen, setIsSidebarOpen } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
          <span className="font-caption text-on-surface-variant">Đang tải thông tin...</span>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      name: 'Bảng điều khiển',
      icon: 'dashboard',
      path: '/dashboard',
    },
    {
      name: 'Thông tin cá nhân',
      icon: 'person',
      path: '/dashboard/profile',
    },
  ];

  if (user.role === 'admin') {
    menuItems.push({
      name: 'Trang quản trị',
      icon: 'admin_panel_settings',
      path: '/admin',
    });
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-surface-container-low border-r border-secondary-container/10 p-6 z-30">
        <div className="mb-8">
          <Link to="/" className="font-display text-h2 text-primary font-bold tracking-tight">
            Luvia
          </Link>
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
                    ? 'bg-primary/10 text-primary font-semibold translate-x-1'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-body-md">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-secondary-container/10">
          <div className="flex items-center space-x-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
              {user.fullname.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-caption font-semibold text-on-surface truncate max-w-[140px]">
                {user.fullname}
              </p>
              <p className="text-xs text-on-surface-variant truncate max-w-[140px]">
                @{user.username}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-error hover:bg-error-container/20 transition-all font-semibold"
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
          <aside className="relative flex flex-col w-64 bg-surface-container-low p-6 h-full border-r border-secondary-container/10">
            <div className="mb-8 flex justify-between items-center">
              <Link to="/" className="font-display text-h2 text-primary font-bold tracking-tight">
                Luvia
              </Link>
              <button onClick={() => setIsSidebarOpen(false)} className="text-on-surface-variant">
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
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span className="font-body-md">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-6 border-t border-secondary-container/10">
              <div className="flex items-center space-x-3 mb-6 px-2">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                  {user.fullname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-caption font-semibold text-on-surface truncate">{user.fullname}</p>
                  <p className="text-xs text-on-surface-variant truncate">@{user.username}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  logout();
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-error hover:bg-error-container/20 transition-all font-semibold"
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
        <header className="flex md:hidden items-center justify-between px-6 py-4 bg-surface border-b border-secondary-container/10">
          <Link to="/" className="font-display text-h3 text-primary font-bold">
            Luvia
          </Link>
          <button onClick={() => setIsSidebarOpen(true)} className="text-on-surface-variant p-2">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>

        {/* Dashboard Main Content */}
        <main className="flex-grow p-6 md:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
