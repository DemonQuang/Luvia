import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-container-low/40 border-t border-secondary-container/10 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link to="/" className="font-display text-h2 text-primary tracking-tight font-bold">
            Luvia
          </Link>
          <p className="font-caption text-on-surface-variant leading-relaxed">
            Lưu giữ trọn vẹn từng nhịp đập của tình yêu trong không gian riêng tư và sang trọng nhất.
          </p>
        </div>

        <div>
          <h4 className="font-label-caps text-label-caps text-primary mb-4 uppercase tracking-wider">Sản phẩm</h4>
          <ul className="space-y-2 font-caption text-on-surface-variant">
            <li><a href="#features" className="hover:text-primary transition-colors">Tính năng</a></li>
            <li><a href="#pricing" className="hover:text-primary transition-colors">Bảng giá</a></li>
            <li><a href="#templates" className="hover:text-primary transition-colors">Mẫu câu chuyện</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-label-caps text-label-caps text-primary mb-4 uppercase tracking-wider">Công ty</h4>
          <ul className="space-y-2 font-caption text-on-surface-variant">
            <li><a href="#about" className="hover:text-primary transition-colors">Về chúng tôi</a></li>
            <li><a href="#blog" className="hover:text-primary transition-colors">Blog tình yêu</a></li>
            <li><a href="#careers" className="hover:text-primary transition-colors">Tuyển dụng</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-label-caps text-label-caps text-primary mb-4 uppercase tracking-wider">Hỗ trợ</h4>
          <ul className="space-y-2 font-caption text-on-surface-variant">
            <li><a href="#help" className="hover:text-primary transition-colors">Trung tâm trợ giúp</a></li>
            <li><a href="#privacy" className="hover:text-primary transition-colors">Bảo mật thông tin</a></li>
            <li><a href="#terms" className="hover:text-primary transition-colors">Điều khoản dịch vụ</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-secondary-container/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-center">
        <p className="font-caption text-on-surface-variant opacity-60">
          &copy; {new Date().getFullYear()} Luvia. Tất cả quyền được bảo lưu.
        </p>
        <p className="font-caption text-on-surface-variant opacity-60 flex gap-4">
          <span>Made with ❤️ in Vietnam</span>
        </p>
      </div>
    </footer>
  );
};
export default Footer;
