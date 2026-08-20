import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth.store';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-white/20 shadow-[0px_10px_30px_rgba(255,94,156,0.04)]">
      <nav className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-2.5 font-display text-h2 text-primary tracking-tight font-bold group">
            <img src="/duck-logo.png" alt="Luvia Duck Mascot" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shadow-sm border border-pink-200/80 group-hover:scale-105 transition-transform" />
            <span>Luvia</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <a href="/#features" className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-all duration-300">
              Tính năng
            </a>
            <a href="/#how-it-works" className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-all duration-300">
              Hành trình
            </a>
            <a href="/#pricing" className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-all duration-300">
              Giá cả
            </a>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="font-caption text-on-surface-variant hidden sm:inline">
                Chào, <strong className="text-primary">{user.fullname}</strong>
              </span>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-primary/10 hover:bg-primary/20 text-primary rounded-full px-5 py-2 font-label-caps text-label-caps transition-all"
              >
                Dashboard
              </button>
              <button
                onClick={logout}
                className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-all px-3 py-2"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="font-label-caps text-label-caps text-primary hover:opacity-80 transition-all px-4 py-2"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="bg-primary-container text-on-primary rounded-full px-6 py-2 font-label-caps text-label-caps shadow-lg hover:opacity-90 active:scale-95 transition-all duration-200"
              >
                Bắt đầu ngay
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
export default Navbar;
