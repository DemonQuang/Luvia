import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth.store';

export const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await register({ fullname, username, email, password });
      setSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng sang Đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center md:text-left">
        <h2 className="font-h1 text-h1 text-on-surface mb-2 font-bold">Đăng ký tài khoản</h2>
        <p className="font-body-md text-on-surface-variant text-sm">Bắt đầu thiết kế không gian tình yêu của bạn.</p>
      </div>

      {error && (
        <div className="bg-error-container/30 border border-error/20 text-error p-4 rounded-xl text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">error</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-green-600">check_circle</span>
          <span>{success}</span>
        </div>
      )}

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="fullname">
            Họ và tên
          </label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
              person
            </span>
            <input
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-secondary-container/30 bg-surface focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all font-body-md"
              id="fullname"
              type="text"
              placeholder="Nguyễn Văn A"
              required
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="username">
            Tên đăng nhập
          </label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
              alternate_email
            </span>
            <input
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-secondary-container/30 bg-surface focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all font-body-md"
              id="username"
              type="text"
              placeholder="nguyenvana"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="email">
            Email
          </label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
              mail
            </span>
            <input
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-secondary-container/30 bg-surface focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all font-body-md"
              id="email"
              type="email"
              placeholder="email@vi-du.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

        <button
          className="w-full py-4 bg-primary text-on-primary font-h3 rounded-xl dreamy-shadow primary-shine active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 mt-4 font-semibold"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined animate-spin text-lg">sync</span>
              Đang xử lý...
            </>
          ) : (
            'Đăng ký'
          )}
        </button>
      </form>

      <p className="text-center font-body-md text-on-surface-variant text-sm">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-primary font-bold hover:underline">
          Đăng nhập ngay
        </Link>
      </p>
    </div>
  );
};
export default RegisterForm;
