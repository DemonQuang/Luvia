import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setSuccess('Liên kết khôi phục mật khẩu đã được gửi đến email của bạn.');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center md:text-left">
        <h2 className="font-h1 text-h1 text-on-surface mb-2 font-bold">Quên mật khẩu</h2>
        <p className="font-body-md text-on-surface-variant text-sm">
          Nhập email đã đăng ký tài khoản để nhận hướng dẫn khôi phục mật khẩu.
        </p>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-green-600">check_circle</span>
          <span>{success}</span>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="email">
            Địa chỉ Email
          </label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
              mail
            </span>
            <input
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-secondary-container/30 bg-surface focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all font-body-md"
              id="email"
              type="email"
              placeholder="email@vi-du.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <button
          className="w-full py-4 bg-primary text-on-primary font-h3 rounded-xl dreamy-shadow primary-shine active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 font-semibold"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined animate-spin text-lg">sync</span>
              Đang xử lý...
            </>
          ) : (
            'Gửi yêu cầu'
          )}
        </button>
      </form>

      <p className="text-center font-body-md text-on-surface-variant text-sm">
        Nhớ ra mật khẩu?{' '}
        <Link to="/login" className="text-primary font-bold hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
};
export default ForgotPasswordForm;
