import React from 'react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-background text-on-surface">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 animate-float">
          <div className="inline-flex items-center space-x-2 bg-primary-fixed/30 border border-primary/10 px-4 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              favorite
            </span>
            <span className="font-label-caps text-label-caps text-primary font-bold">Nơi tình yêu được lưu giữ vĩnh cửu</span>
          </div>

          <h1 className="font-display text-display text-on-surface leading-tight font-bold">
            Thiết kế không gian riêng cho câu chuyện tình yêu của bạn
          </h1>

          <p className="font-body-lg text-on-surface-variant leading-relaxed">
            Luvia cho phép bạn dễ dàng kiến tạo những trang kỷ niệm ngọt ngào với hình ảnh, lời chúc tự tay biên tập, bản nhạc yêu thích, và bảo mật bằng mã PIN. Hãy chia sẻ món quà vô giá này cho người thương.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              to="/register"
              className="bg-primary text-on-primary font-h3 rounded-full px-8 py-4 shadow-lg hover:opacity-95 active:scale-95 transition-all primary-shine dreamy-shadow"
            >
              Bắt đầu thiết kế ngay
            </Link>
            <a
              href="#features"
              className="border border-secondary-container text-on-surface hover:bg-surface-container-high rounded-full px-8 py-4 font-h3 transition-all flex items-center gap-2"
            >
              Xem các tính năng
            </a>
          </div>
        </div>

        {/* Right side illustration card mockup */}
        <div className="relative flex justify-center">
          <div className="relative w-full max-w-md aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/20">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXG8iyuuF4M-FiTUQe1GSi8IxSGoPN78YjyGWuWUlSCqvoOjpXafxQN_8jOvv7nBki7eAjcxmD5O9JYau76xVdBVZpXQFWCE4m1P78mwBJPVMx9KifrOFqMY0IVWaoWi9lLtw_ztLNqlRWSoSTKx4XRt7gUkbv4FTVwpnW8NxyOze3pAxdb71evSMajD0iFsQ8GDkJS7O4g3_jgFPzMRX3V-PUryKf-L5DB7M71tNGyPKkzUFPkSkP"
              alt="Romantic Moment"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
              <span className="font-label-caps text-xs text-primary-fixed uppercase tracking-wider block mb-2">Thư viện câu chuyện</span>
              <h2 className="font-h2 text-h2 leading-tight italic font-bold">"Hai ta cùng viết nên câu chuyện đẹp nhất cuộc đời..."</h2>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="py-24 bg-surface-container-low/40 border-t border-b border-secondary-container/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="font-display text-h1 text-on-surface font-bold">Tính năng nổi bật</h2>
            <p className="font-body-md text-on-surface-variant">
              Mỗi tính năng của Luvia được hoàn thiện tỉ mỉ để đem lại trải nghiệm lãng mạn cao cấp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-[2rem] text-center space-y-4 hover:scale-[1.02] transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-2xl">auto_awesome</span>
              </div>
              <h3 className="font-h3 text-h3 text-on-surface font-bold">Giao diện Minimal Luxury</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Tối giản, trang nhã. Sử dụng hiệu ứng mờ kính Glassmorphism, chuyển động mềm mại, tạo chiều sâu nghệ thuật.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-[2rem] text-center space-y-4 hover:scale-[1.02] transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-2xl">music_note</span>
              </div>
              <h3 className="font-h3 text-h3 text-on-surface font-bold">Nhạc nền lãng mạn</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Tải lên những bài hát gắn liền với kỷ niệm của hai người, tự động phát kèm hiệu ứng sóng nhạc trực quan sinh động.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-[2rem] text-center space-y-4 hover:scale-[1.02] transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-2xl">encrypted</span>
              </div>
              <h3 className="font-h3 text-h3 text-on-surface font-bold">Bảo mật mã PIN</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Đảm bảo không gian riêng tư của hai bạn. Người nhận quà chỉ có thể xem nội dung sau khi nhập đúng mã PIN bảo vệ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps section */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <h2 className="font-display text-h1 text-on-surface font-bold">3 Bước tạo món quà yêu thương</h2>
          <p className="font-body-md text-on-surface-variant">Quy trình đơn giản nhưng tràn đầy sự quan tâm.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="space-y-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg shadow-md">
              1
            </div>
            <h3 className="font-h3 text-h3 text-on-surface font-bold">Biên soạn nội dung</h3>
            <p className="text-sm text-on-surface-variant">
              Viết những lời chúc ngọt ngào, chia sẻ các cột mốc câu chuyện và chọn những bức hình kỷ niệm.
            </p>
          </div>

          <div className="space-y-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg shadow-md">
              2
            </div>
            <h3 className="font-h3 text-h3 text-on-surface font-bold">Trang trí & Thiết lập PIN</h3>
            <p className="text-sm text-on-surface-variant">
              Lựa chọn tông màu giao diện, tải lên file nhạc bài hát kỷ niệm và tạo mật khẩu mở khóa.
            </p>
          </div>

          <div className="space-y-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg shadow-md">
              3
            </div>
            <h3 className="font-h3 text-h3 text-on-surface font-bold">Gửi tặng người ấy</h3>
            <p className="text-sm text-on-surface-variant">
              Sao chép đường dẫn (link) và gửi tặng người ấy. Ngắm nhìn nụ cười của họ khi mở khóa câu chuyện tình yêu.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
export default LandingPage;
