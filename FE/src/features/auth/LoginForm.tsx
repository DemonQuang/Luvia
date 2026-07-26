import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth.store';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({ usernameOrEmail, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Sai thông tin tài khoản hoặc mật khẩu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center md:text-left">
        <h2 className="font-h1 text-h1 text-on-surface mb-2 font-bold">Chào mừng trở lại</h2>
        <p className="font-body-md text-on-surface-variant text-sm">Đăng nhập để tiếp tục viết câu chuyện của bạn.</p>
      </div>

      {error && (
        <div className="bg-error-container/30 border border-error/20 text-error p-4 rounded-xl text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="username">
            Tên đăng nhập hoặc Email
          </label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
              mail
            </span>
            <input
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-secondary-container/30 bg-surface focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all font-body-md"
              id="username"
              type="text"
              placeholder="username hoặc email"
              required
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="password">
            Mật khẩu
          </label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
              lock
            </span>
            <input
              className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-secondary-container/30 bg-surface focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all font-body-md"
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              <span className="material-symbols-outlined">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between py-1">
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input
              className="w-4 h-4 rounded border-secondary-container text-primary focus:ring-primary-container cursor-pointer"
              type="checkbox"
            />
            <span className="font-caption text-on-surface-variant group-hover:text-primary transition-colors text-xs">
              Ghi nhớ đăng nhập
            </span>
          </label>
          <Link to="/forgot-password" className="font-caption text-primary hover:underline font-semibold text-xs">
            Quên mật khẩu?
          </Link>
        </div>

        <button
          className="w-full py-4 bg-primary text-on-primary font-h3 rounded-xl dreamy-shadow primary-shine active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 font-semibold"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined animate-spin text-lg">sync</span>
              Đang xác thực...
            </>
          ) : (
            'Đăng nhập'
          )}
        </button>
      </form>

      <p className="text-center font-body-md text-on-surface-variant text-sm">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-primary font-bold hover:underline">
          Bắt đầu ngay
        </Link>
      </p>
    </div>
  );
};
export default LoginForm;
