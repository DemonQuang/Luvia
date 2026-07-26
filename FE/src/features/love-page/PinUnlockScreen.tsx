import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { ShaderBackground } from '../../components/ui/ShaderBackground';

interface PinUnlockScreenProps {
  slug: string;
  onUnlock: (pinToken: string) => void;
}

export const PinUnlockScreen: React.FC<PinUnlockScreenProps> = ({ slug, onUnlock }) => {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.substring(value.length - 1);
    setPin(newPin);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 4);
    
    if (pastedData) {
      const newPin = [...pin];
      for (let i = 0; i < pastedData.length; i++) {
        newPin[i] = pastedData[i];
      }
      setPin(newPin);
      
      const targetIndex = Math.min(pastedData.length, 3);
      inputRefs[targetIndex].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const pinStr = pin.join('');
    
    if (pinStr.length < 4) {
      setError('Vui lòng nhập đủ 4 chữ số mã PIN.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.loves.verifyPin(slug, pinStr);
      if (res.success && res.accessToken) {
        onUnlock(res.accessToken);
      } else {
        setError('Xác thực thất bại.');
      }
    } catch (err: any) {
      setError(err.message || 'Mã PIN không chính xác, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      <ShaderBackground />

      <main className="relative z-10 w-full max-w-md px-6">
        <div className="glass-panel rounded-[24px] p-8 md:p-12 flex flex-col items-center text-center shadow-lg">
          <div className="mb-8">
            <h1 className="font-display text-h1 text-primary tracking-tight font-bold">Luvia</h1>
          </div>

          <div className="mb-6 animate-float">
            <div className="relative inline-block">
              <span className="material-symbols-outlined text-primary-container text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                lock
              </span>
              <span className="material-symbols-outlined text-primary absolute -top-2 -right-2 text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
              </span>
            </div>
          </div>

          <h2 className="font-h2 text-h2 text-on-surface mb-3 font-semibold">Một món quà dành riêng cho bạn</h2>
          <p className="font-body-md text-on-surface-variant mb-8 leading-relaxed text-sm">
            Vui lòng nhập mã PIN để mở khóa câu chuyện tình yêu.
          </p>

          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            <div className="flex justify-center gap-4">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  pattern="\d*"
                  inputMode="numeric"
                  maxLength={1}
                  autoComplete="one-time-code"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  className="w-14 h-16 text-center text-h2 font-bold border-2 border-primary-fixed focus:border-primary bg-surface rounded-xl outline-none focus:ring-4 focus:ring-primary-container/20 transition-all font-body-md"
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center justify-center gap-2 text-error font-caption">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <button
              className="w-full py-4 bg-primary text-on-primary font-h3 rounded-full shadow-[0px_10px_30px_rgba(255,94,156,0.3)] active:scale-98 transition-all duration-300 flex items-center justify-center gap-2 primary-shine font-bold"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                  Đang kiểm tra...
                </>
              ) : (
                'Mở khóa ngay'
              )}
            </button>
          </form>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => alert('Vui lòng liên hệ với người tạo trang để lấy mã PIN.')}
              className="text-primary font-label-caps hover:underline transition-all font-semibold text-xs"
            >
              Quên mã PIN?
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
export default PinUnlockScreen;
