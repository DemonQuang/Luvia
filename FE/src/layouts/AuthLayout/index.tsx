import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row overflow-hidden bg-background">
      {/* Left Column: Aesthetic Visual Content (Shared for Auth pages) */}
      <section className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden bg-surface-container">
        <div className="absolute inset-0 z-10 p-12 flex flex-col justify-between">
          <div className="flex items-center space-x-2">
            <Link to="/" className="font-display text-h2 text-primary font-bold tracking-tight">Luvia</Link>
          </div>
          <div className="max-w-md">
            <h1 className="font-display text-display text-primary leading-tight mb-4">
              Mỗi khoảnh khắc là một món quà.
            </h1>
            <p className="font-body-lg text-on-surface-variant">
              Lưu giữ trọn vẹn từng nhịp đập của tình yêu trong không gian riêng tư và sang trọng nhất.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex -space-x-3">
              <img
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0ghonzpyq5WX_vYAxbAtXUSsKOO41Z1eXbg6b8IIaWPanJ3cB2bv7FTIM8DtjPLOGMMCT1jgfPHQj71yaoDZWbZTqmpxK3w0JX2M881109DxL7mlxM1ZGZFIqLtrl1S1jJu-yH9DriN3993d5T7zlCGEyjmHXFXggITwN4T9_mJZ4BR5X7ZqjIngn6oXKd-sTylmm-AELJEW0dhCdBcY2W55ryJfxgNliFHyiphgqcHqsFqJsFyIl"
                alt="Couple"
              />
              <img
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQBghwUxO8GOWIxAIQVSb1hPZ49BF80m2gJ3IUQ5wDagcKC2Jou51DGGT2B9G2ipMazjOqVHyQYoSPq-Yv6W-ZnIVIBHB1ZYD74J-kC0cSwzKoGh_i0IRxV94RVgt3nizk3GCsATly9MuZxioNiRB5eDW_e8dvq5I2VoBiDfV921sfATL4ryLHbeQxXllbztz77KDB17F55BdAnxeQ79QpL3CuYyqIzbhQAoTJkGLdG7KfGxHdj1Zt"
                alt="Couple"
              />
            </div>
            <span className="font-caption text-on-surface-variant">
              Hơn 50,000 cặp đôi đã bắt đầu câu chuyện của họ.
            </span>
          </div>
        </div>

        {/* Main Imagery Background */}
        <div className="absolute inset-0 w-full h-full">
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-10000 hover:scale-110"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDWvMZ3jM2-WuQ04-KScRR6dU1Tnp0BfkTnqabX3nwSqC7v48jtUM3QEmP7r5y50xa13PGDfKWA0ssytD4HcEIQ1evbR6AXIQqsbjIVr3jRcMWTpisjwhLEcBpi_ZcykBogSk4cj0f6yaCSZ2CynAo-J9NwU7RGzk8lcoTIUMaO37roOnHj6uICYEek5-AsEfSMKdsky7YAkMagNx8VHtoI6PTluQhDq1ESjB7R6wBK3xYOprnxYHpM')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        </div>
      </section>

      {/* Right Column Form Container */}
      <section className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 md:p-12 lg:p-16 bg-surface">
        <div className="w-full max-w-sm space-y-8">
          <div className="md:hidden flex justify-center mb-8">
            <Link to="/" className="font-display text-h1 text-primary tracking-tight font-bold">Luvia</Link>
          </div>
          
          {/* Render children form pages */}
          <Outlet />
          
          {/* Footer Links */}
          <div className="pt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 opacity-60">
            <a className="font-caption hover:text-primary transition-colors text-xs" href="#terms">Điều khoản</a>
            <a className="font-caption hover:text-primary transition-colors text-xs" href="#privacy">Bảo mật</a>
            <a className="font-caption hover:text-primary transition-colors text-xs" href="#support">Hỗ trợ</a>
          </div>
        </div>
      </section>
    </div>
  );
};
export default AuthLayout;
