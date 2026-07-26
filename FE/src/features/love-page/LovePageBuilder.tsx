import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

export const LovePageBuilder: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  // Wizard States
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Values
  const [title, setTitle] = useState('');
  const [recipient, setRecipient] = useState('');
  const [occasion, setOccasion] = useState('Ngày kỷ niệm yêu nhau');
  const [heroMessage, setHeroMessage] = useState('');
  const [moments, setMoments] = useState<{ title: string; content: string }[]>([
    { title: '', content: '' },
    { title: '', content: '' }
  ]);
  const [loveMessage, setLoveMessage] = useState('');
  const messages: string[] = [
    heroMessage,
    ...moments.map(m => `${m.title}||${m.content}`),
    loveMessage
  ];

  // Theme state
  const [theme, setTheme] = useState<'cute' | 'romantic' | 'dark'>('cute');

  // Security PIN
  const [pin, setPin] = useState('');

  // File uploads
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [selectedMusic, setSelectedMusic] = useState<File | null>(null);
  const [musicPreviewName, setMusicPreviewName] = useState('');
  const [existingMusic, setExistingMusic] = useState('');

  // Result slug
  const [createdSlug, setCreatedSlug] = useState('');

  // Load existing data in Edit Mode
  useEffect(() => {
    if (isEditMode) {
      const loadPageData = async () => {
        try {
          const res = await api.loves.getLoves();
          if (res.success && res.data) {
            const page = res.data.find(p => p._id === id);
            if (page) {
              setTitle(page.title);
              setTheme(page.theme);
              if (page.content) {
                const msgs = page.content.messages || [];
                if (msgs.length > 0) setHeroMessage(msgs[0]);
                if (msgs.length > 2) {
                  const momentList = msgs.slice(1, -1).map(m => {
                    const sep = m.indexOf('||');
                    return sep > 0
                      ? { title: m.slice(0, sep), content: m.slice(sep + 2) }
                      : { title: '', content: m };
                  });
                  setMoments(momentList.length > 0 ? momentList : [{ title: '', content: '' }]);
                }
                if (msgs.length > 1) setLoveMessage(msgs[msgs.length - 1]);
                setExistingImages(page.content.images || []);
                setExistingMusic(page.content.music || '');
                setRecipient(page.content.recipient || '');
                setOccasion(page.content.occasion || 'Ngày kỷ niệm yêu nhau');
              }
            } else {
              setError('Không tìm thấy trang kỷ niệm cần sửa.');
            }
          }
        } catch (e) {
          setError('Lỗi khi tải thông tin trang kỷ niệm.');
        }
      };
      loadPageData();
    }
  }, [id, isEditMode]);

  const handleNext = () => {
    if (currentStep === 1 && (!title.trim() || !recipient.trim())) {
      setError('Vui lòng nhập đầy đủ Tiêu đề và Tên người nhận.');
      return;
    }
    if (currentStep === 2) {
      if (!heroMessage.trim()) {
        setError('Vui lòng nhập lời nhắn ngày kỷ niệm.');
        return;
      }
      if (moments.some(m => !m.title.trim() || !m.content.trim())) {
        setError('Vui lòng nhập đầy đủ tiêu đề và nội dung cho các khoảnh khắc.');
        return;
      }
      if (!loveMessage.trim()) {
        setError('Vui lòng nhập lời yêu thương.');
        return;
      }
    }
    if (currentStep === 6 && pin.length < 4) {
      setError('Mã PIN bảo mật phải có ít nhất 4 ký tự.');
      return;
    }

    setError('');
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  // Moments handling
  const handleAddMoment = () => {
    setMoments([...moments, { title: '', content: '' }]);
  };

  const handleRemoveMoment = (index: number) => {
    if (moments.length <= 1) return;
    setMoments(moments.filter((_, idx) => idx !== index));
  };

  const handleMomentChange = (index: number, field: 'title' | 'content', value: string) => {
    const updated = [...moments];
    updated[index] = { ...updated[index], [field]: value };
    setMoments(updated);
  };

  // Image handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const totalImages = selectedImages.length + filesArray.length + existingImages.length;

      if (totalImages > 10) {
        alert('Chỉ được tải lên tối đa 10 ảnh.');
        return;
      }

      setSelectedImages([...selectedImages, ...filesArray]);

      const previews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...previews]);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  // Music handling
  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        alert('File nhạc vượt quá dung lượng tối đa 20MB.');
        return;
      }
      setSelectedMusic(file);
      setMusicPreviewName(file.name);
    }
  };

  const handleRemoveMusic = () => {
    setSelectedMusic(null);
    setMusicPreviewName('');
  };

  const handleRemoveExistingMusic = () => {
    setExistingMusic('');
  };

  // Submit flow
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('theme', theme);

      if (pin) {
        formData.append('pin', pin);
      }

      const contentJson = {
        messages: messages,
        recipient: recipient,
        occasion: occasion,
        existingImages: existingImages,
        existingMusic: existingMusic
      };

      formData.append('content', JSON.stringify(contentJson));

      selectedImages.forEach(img => {
        formData.append('images', img);
      });

      if (selectedMusic) {
        formData.append('music', selectedMusic);
      }

      let response;
      if (isEditMode) {
        response = await api.loves.updateLove(id!, formData);
      } else {
        response = await api.loves.createLove(formData);
      }

      if (response.success && response.data) {
        setCreatedSlug(response.data.slug);
        setCurrentStep(8);
      } else {
        setError(response.message || 'Lỗi khi lưu dữ liệu.');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi hệ thống xảy ra khi lưu trang kỷ niệm.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <div className="w-full mb-10">
        <div className="flex justify-between items-center relative px-2">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-secondary-fixed -translate-y-1/2 -z-10" />
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 -z-10 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / 7) * 100}%` }}
          />
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-4 border-background transition-all duration-300 ${currentStep > i + 1
                  ? 'bg-primary text-white'
                  : currentStep === i + 1
                    ? 'bg-primary text-white scale-110 shadow-[0_0_15px_rgba(255,94,156,0.4)]'
                    : 'bg-secondary-fixed text-on-surface-variant'
                  }`}
              >
                {i + 1}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-3 text-xs font-semibold text-primary uppercase tracking-wider">
          Bước {currentStep} trên 7 — {
            currentStep === 1 ? 'Thông tin' :
              currentStep === 2 ? 'Lời nhắn' :
                currentStep === 3 ? 'Hình ảnh' :
                  currentStep === 4 ? 'Âm nhạc' :
                    currentStep === 5 ? 'Giao diện' :
                      currentStep === 6 ? 'Bảo mật' :
                        'Hoàn tất'
          }
        </div>
      </div>

      {error && (
        <div className="w-full bg-error-container/30 border border-error/20 text-error p-4 rounded-xl text-sm font-medium flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-lg">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Main card */}
      <div className="w-full glass-panel rounded-[32px] p-8 md:p-12 mb-8 min-h-[450px] flex flex-col justify-between shadow-lg">

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <section className="space-y-6">
            <div>
              <h2 className="font-h1 text-h1 text-on-surface mb-2 font-bold">Thông tin ban đầu</h2>
              <p className="text-on-surface-variant font-body-md">Hãy điền thông tin cơ bản về dịp kỷ niệm ý nghĩa này nhé.</p>
            </div>

            <div className="space-y-4">
              <div className="group">
                <label className="block font-label-caps text-label-caps text-primary mb-2 uppercase tracking-widest text-xs font-semibold">Tiêu đề kỷ niệm</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-6 py-4 rounded-xl border border-secondary-fixed bg-white/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-lg text-on-surface"
                  placeholder="Ví dụ: 365 Ngày Bên Nhau..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-label-caps text-label-caps text-primary mb-2 uppercase tracking-widest text-xs font-semibold">Tên người thương nhận quà</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    className="w-full px-6 py-4 rounded-xl border border-secondary-fixed bg-white/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md"
                    placeholder="Người ấy tên là gì?"
                    required
                  />
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-primary mb-2 uppercase tracking-widest text-xs font-semibold">Dịp kỷ niệm</label>
                  <select
                    value={occasion}
                    onChange={e => setOccasion(e.target.value)}
                    className="w-full px-6 py-4 rounded-xl border border-secondary-fixed bg-white/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md cursor-pointer animate-in"
                  >
                    <option>Ngày kỷ niệm yêu nhau</option>
                    <option>Sinh nhật</option>
                    <option>Ngày cưới</option>
                    <option>Valentine</option>
                    <option>Quà tặng bất ngờ</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Step 2: Messages */}
        {currentStep === 2 && (
          <section className="space-y-6">
            <div>
              <h2 className="font-h1 text-h1 text-on-surface mb-2 font-bold">Viết lời nhắn gửi</h2>
              <p className="text-on-surface-variant font-body-md">Những lời yêu thương sẽ được trình bày thành câu chuyện kỷ niệm.</p>
            </div>

            <div className="space-y-5 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
              {/* Section 1: Anniversary Message */}
              <div className="p-5 border border-secondary-fixed rounded-2xl bg-white/30">
                <div className="flex items-center gap-3 mb-3">
                  <div>
                    <span className="font-label-caps text-[10px] text-primary uppercase font-bold block">Lời nhắn ngày kỷ niệm</span>
                    <span className="text-[11px] text-on-surface-variant">Đoạn mở đầu cho câu chuyện của hai bạn</span>
                  </div>
                </div>
                <textarea
                  value={heroMessage}
                  onChange={e => setHeroMessage(e.target.value)}
                  className="w-full h-24 p-3 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-on-surface-variant font-body-md"
                  placeholder="Trên thế gian này, không có trái tim nào dành cho anh như trái tim em..."
                />
              </div>

              {/* Section 2-3: Moments */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary text-sm">auto_stories</span>
                    </div>
                    <div>
                      <span className="font-label-caps text-[10px] text-secondary uppercase font-bold block">Lời nhắn khoảnh khắc</span>
                      <span className="text-[11px] text-on-surface-variant">Mỗi khoảnh khắc là một chương trong câu chuyện</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMoment}
                    className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xs">add</span>
                    Thêm khoảnh khắc
                  </button>
                </div>

                {moments.map((moment, index) => (
                  <div key={index} className="p-5 border border-secondary-fixed rounded-2xl bg-white/30">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-label-caps text-[10px] text-secondary uppercase font-bold">
                        Khoảnh khắc {index + 1}
                      </span>
                      {moments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMoment(index)}
                          className="text-error hover:bg-error-container/20 p-1 rounded-lg transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <input
                        value={moment.title}
                        onChange={e => handleMomentChange(index, 'title', e.target.value)}
                        className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-on-surface font-body-md font-medium"
                        placeholder="Tiêu đề khoảnh khắc (VD: Ngày đầu mình gặp...)"
                      />
                      <textarea
                        value={moment.content}
                        onChange={e => handleMomentChange(index, 'content', e.target.value)}
                        className="w-full h-20 p-3 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-on-surface-variant font-body-md"
                        placeholder="Chẳng ai nghĩ rằng một buổi chiều mưa ấy lại thay đổi cả cuộc đời..."
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Section 4: Love Message */}
              <div className="p-5 border border-secondary-fixed rounded-2xl bg-white/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-error-container/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-error text-sm">favorite</span>
                  </div>
                  <div>
                    <span className="font-label-caps text-[10px] text-error uppercase font-bold block">Lời yêu thương</span>
                    <span className="text-[11px] text-on-surface-variant">Lời kết cho câu chuyện tình yêu</span>
                  </div>
                </div>
                <textarea
                  value={loveMessage}
                  onChange={e => setLoveMessage(e.target.value)}
                  className="w-full h-24 p-3 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-on-surface-variant font-body-md font-handwriting text-lg"
                  placeholder="Em à, có những điều thật khó để nói thành lời..."
                />
              </div>
            </div>
          </section>
        )}

        {/* Step 3: Images */}
        {currentStep === 3 && (
          <section className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-h1 text-h1 text-on-surface mb-2 font-bold">Khoảnh khắc đáng nhớ</h2>
                <p className="text-on-surface-variant font-body-md">Tải lên những bức ảnh đẹp nhất của cả hai (Tối đa 10 ảnh).</p>
              </div>
              <span className="font-label-caps text-xs text-primary px-3 py-1 bg-primary-fixed/40 rounded-full font-bold">
                Đã chọn: {selectedImages.length + existingImages.length}/10
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto pr-2">
              {existingImages.map((imgUrl, index) => (
                <div key={`existing-${index}`} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm group border">
                  <img src={imgUrl} alt="Existing" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(index)}
                      className="p-2 bg-error rounded-full text-white"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">delete</span>
                    </button>
                  </div>
                </div>
              ))}

              {imagePreviews.map((previewUrl, index) => (
                <div key={`new-${index}`} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm group border">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
                      className="p-2 bg-error rounded-full text-white"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">delete</span>
                    </button>
                  </div>
                </div>
              ))}

              {selectedImages.length + existingImages.length < 10 && (
                <label className="aspect-square border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary-container/5 transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-primary text-3xl">add_a_photo</span>
                  <span className="font-label-caps text-[10px] text-primary uppercase text-center px-4 font-bold">Tải ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </section>
        )}

        {/* Step 4: Music */}
        {currentStep === 4 && (
          <section className="space-y-6">
            <div>
              <h2 className="font-h1 text-h1 text-on-surface mb-2 font-bold">Chọn âm nhạc nền</h2>
              <p className="text-on-surface-variant font-body-md">Định dạng hỗ trợ: MP3 hoặc WAV (Tối đa 20MB).</p>
            </div>

            <div className="space-y-6">
              {existingMusic && (
                <div className="p-4 bg-primary-fixed/20 border border-primary/10 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-primary">
                    <span className="material-symbols-outlined">music_note</span>
                    <span className="text-xs font-semibold truncate max-w-[200px]">Đã có sẵn nhạc nền trên máy chủ</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveExistingMusic}
                    className="text-error hover:bg-error-container/20 p-2 rounded-lg"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              )}

              {selectedMusic ? (
                <div className="p-4 bg-primary-fixed/20 border border-primary/10 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-primary">
                    <span className="material-symbols-outlined">music_note</span>
                    <span className="text-xs font-semibold truncate max-w-[200px]">{musicPreviewName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveMusic}
                    className="text-error hover:bg-error-container/20 p-2 rounded-lg"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ) : (
                !existingMusic && (
                  <label className="border-2 border-dashed border-primary/30 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary-container/5 transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-primary text-4xl">cloud_upload</span>
                    <div>
                      <h3 className="font-h3 text-h3 text-on-surface mb-1 text-center font-bold">Tải file nhạc lên</h3>
                      <p className="font-caption text-xs text-on-surface-variant text-center">Kéo thả file âm thanh của bạn vào đây</p>
                    </div>
                    <input
                      type="file"
                      accept="audio/mp3,audio/wav"
                      onChange={handleMusicChange}
                      className="hidden"
                    />
                  </label>
                )
              )}
            </div>
          </section>
        )}

        {/* Step 5: Themes */}
        {currentStep === 5 && (
          <section className="space-y-6">
            <div>
              <h2 className="font-h1 text-h1 text-on-surface mb-2 font-bold">Chọn chủ đề giao diện</h2>
              <p className="text-on-surface-variant font-body-md">Điều chỉnh màu sắc và phong cách hiển thị câu chuyện của bạn.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div
                onClick={() => setTheme('cute')}
                className={`p-6 border rounded-[2rem] cursor-pointer transition-all duration-300 flex flex-col items-center gap-4 text-center ${theme === 'cute'
                  ? 'border-primary bg-primary/5 ring-4 ring-primary-container/10 scale-[1.02]'
                  : 'border-secondary-fixed bg-white/40 hover:border-primary'
                  }`}
              >
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl font-bold">favorite</span>
                </div>
                <div>
                  <h3 className="font-h3 text-h3 text-on-surface font-bold">Cute</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Dễ thương, ấm áp với tông hồng phấn dịu dàng.</p>
                </div>
              </div>

              <div
                onClick={() => setTheme('romantic')}
                className={`p-6 border rounded-[2rem] cursor-pointer transition-all duration-300 flex flex-col items-center gap-4 text-center ${theme === 'romantic'
                  ? 'border-primary bg-primary/5 ring-4 ring-primary-container/10 scale-[1.02]'
                  : 'border-secondary-fixed bg-white/40 hover:border-primary'
                  }`}
              >
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <span className="material-symbols-outlined text-2xl font-bold">favorite_active</span>
                </div>
                <div>
                  <h3 className="font-h3 text-h3 text-red-600 font-bold">Romantic</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Lãng mạn đậm đà, tích hợp hiệu ứng bay tim 3D.</p>
                </div>
              </div>

              <div
                onClick={() => setTheme('dark')}
                className={`p-6 border rounded-[2rem] cursor-pointer transition-all duration-300 flex flex-col items-center gap-4 text-center ${theme === 'dark'
                  ? 'border-slate-800 bg-slate-900 ring-4 ring-slate-800/25 scale-[1.02]'
                  : 'border-secondary-fixed bg-white/40 hover:border-primary'
                  }`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-100">
                  <span className="material-symbols-outlined text-2xl font-bold">nights_stay</span>
                </div>
                <div>
                  <h3 className={`font-h3 text-h3 font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Dark Romance</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Huyền ảo, bí ẩn với giao diện tối tối giản sang trọng.</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Step 6: Security */}
        {currentStep === 6 && (
          <section className="space-y-6">
            <div>
              <h2 className="font-h1 text-h1 text-on-surface mb-2 font-bold">Bảo mật bằng mã PIN</h2>
              <p className="text-on-surface-variant font-body-md">Người nhận cần nhập đúng mã này để mở khóa nội dung câu chuyện.</p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div className="group">
                <label className="block font-label-caps text-label-caps text-primary mb-2 uppercase tracking-widest text-center text-xs font-semibold">Nhập mã PIN (Tối thiểu 4 chữ số)</label>
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-6 py-4 rounded-xl border border-secondary-fixed bg-white/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-center font-bold text-h2 tracking-[1em]"
                  placeholder="••••"
                  required
                />
              </div>
              <p className="text-xs text-on-surface-variant text-center italic">Chỉ cho phép các chữ số (0-9).</p>
            </div>
          </section>
        )}

        {/* Step 7: Summary */}
        {currentStep === 7 && (
          <section className="space-y-6">
            <div>
              <h2 className="font-h1 text-h1 text-on-surface mb-2 font-bold">Sẵn sàng xuất bản</h2>
              <p className="text-on-surface-variant font-body-md">Kiểm tra lại toàn bộ thông tin trước khi tạo trang kỷ niệm của hai bạn.</p>
            </div>

            <div className="space-y-4 font-body-md text-on-surface-variant">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-secondary-container/10">
                <div>
                  <span className="font-bold text-xs uppercase tracking-wider block text-primary">Tiêu đề kỷ niệm</span>
                  <span className="text-on-surface text-lg font-medium">{title}</span>
                </div>
                <div>
                  <span className="font-bold text-xs uppercase tracking-wider block text-primary">Tên người nhận</span>
                  <span className="text-on-surface text-lg font-medium">{recipient}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pb-4 border-b border-secondary-container/10">
                <div>
                  <span className="font-bold text-xs block text-primary uppercase">Dịp kỷ niệm</span>
                  <span className="text-on-surface font-medium">{occasion}</span>
                </div>
                <div>
                  <span className="font-bold text-xs block text-primary uppercase">Chủ đề giao diện</span>
                  <span className="text-on-surface font-medium capitalize">{theme}</span>
                </div>
                <div>
                  <span className="font-bold text-xs block text-primary uppercase">Mã bảo mật PIN</span>
                  <span className="text-on-surface font-medium">•••• (đã thiết lập)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-bold text-xs block text-primary uppercase">Tổng số ảnh</span>
                  <span className="text-on-surface font-medium">{selectedImages.length + existingImages.length} ảnh</span>
                </div>
                <div>
                  <span className="font-bold text-xs block text-primary uppercase">Nhạc nền</span>
                  <span className="text-on-surface font-medium">
                    {selectedMusic || existingMusic ? 'Đã tải lên' : 'Không có'}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Form controls */}
        <div className="pt-8 border-t border-secondary-container/10 flex justify-between items-center mt-8">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl border border-secondary-fixed text-on-surface-variant hover:bg-surface-container-high transition-all text-sm font-semibold"
            >
              Quay lại
            </button>
          )}

          {currentStep < 7 ? (
            <button
              onClick={handleNext}
              className="ml-auto bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold shadow-md hover:opacity-90 transition-all flex items-center gap-1.5 text-sm"
            >
              Tiếp tục
              <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="ml-auto bg-primary text-on-primary px-8 py-3.5 rounded-xl font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-2 primary-shine"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  Đang xử lý lưu...
                </>
              ) : (
                'Xuất bản ngay'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Success step */}
      {currentStep === 8 && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-lg bg-surface rounded-[2rem] p-8 md:p-12 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto animate-bounce">
              <span className="material-symbols-outlined text-4xl font-bold">celebration</span>
            </div>

            <div className="space-y-2">
              <h2 className="font-h2 text-h2 text-on-surface font-bold">Chúc mừng hai bạn!</h2>
              <p className="font-body-md text-on-surface-variant text-sm">
                Trang kỷ niệm tình yêu của hai bạn đã được xuất bản trực tuyến thành công.
              </p>
            </div>

            <div className="bg-surface-container-low p-5 rounded-2xl border border-secondary-container/10">
              <span className="text-xs text-on-surface-variant block mb-1">Mã liên kết 6 ký tự (Slug)</span>
              <code className="text-2xl text-primary font-mono font-bold block mb-4">{createdSlug}</code>

              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/page/${createdSlug}`}
                  className="flex-1 px-4 py-2 border rounded-xl bg-white text-xs select-all text-on-surface-variant font-mono"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/page/${createdSlug}`);
                    alert('Đã copy link!');
                  }}
                  className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-semibold"
                >
                  Copy Link
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <button
                onClick={() => {
                  window.open(`/page/${createdSlug}`, '_blank');
                }}
                className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-semibold text-sm shadow-md"
              >
                Mở xem trang ngay
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3.5 border border-secondary-fixed text-on-surface-variant hover:bg-surface-container-high rounded-xl font-semibold text-sm"
              >
                Trở về Bảng điều khiển
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default LovePageBuilder;
