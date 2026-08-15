import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { RecipientType, Theme, Occasion, Music } from '../../types';
import { EmotionalTemplates } from './EmotionalTemplates';

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
  const [recipientType, setRecipientType] = useState<RecipientType>('LOVER');
  const [occasion, setOccasion] = useState('anniversary');
  const [heroMessage, setHeroMessage] = useState('');
  const [moments, setMoments] = useState<{ title: string; content: string }[]>([
    { title: '', content: '' },
    { title: '', content: '' }
  ]);
  const [loveMessage, setLoveMessage] = useState('');

  // Theme selection
  const [theme, setTheme] = useState('cute');

  // Security PIN
  const [pin, setPin] = useState('');

  // File uploads / Music library selection
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState<string>('');
  const [useMainImage, setUseMainImage] = useState<boolean>(true);

  // Music state
  const [musicSource, setMusicSource] = useState<'system' | 'custom'>('system');
  const [systemMusics, setSystemMusics] = useState<Music[]>([]);
  const [selectedSystemMusicId, setSelectedSystemMusicId] = useState<string>('');
  const [previewingMusic, setPreviewingMusic] = useState('');
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [musicPreviewName, setMusicPreviewName] = useState('');
  const [existingMusic, setExistingMusic] = useState('');
  const [selectedMusic, setSelectedMusic] = useState<File | null>(null);

  const previewSystemMusic = useCallback((url: string) => {
    if (!url) return;
    if (previewingMusic === url && previewAudioRef.current) {
      previewAudioRef.current.pause();
      setPreviewingMusic('');
      return;
    }
    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio();
      previewAudioRef.current.addEventListener('ended', () => setPreviewingMusic(''));
    }
    previewAudioRef.current.src = new URL(url, window.location.href).href;
    previewAudioRef.current.load();
    previewAudioRef.current.play().then(() => setPreviewingMusic(url)).catch(() => {});
  }, [previewingMusic]);

  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.src = '';
      }
    };
  }, []);

  // AI Music states for user
  // DB Options
  const [occasionsList, setOccasionsList] = useState<Occasion[]>([]);
  const [themesList, setThemesList] = useState<Theme[]>([]);
  const [showAllThemes, setShowAllThemes] = useState(false);
  const [loadingThemes, setLoadingThemes] = useState(false);

  // Result slug
  const [createdSlug, setCreatedSlug] = useState('');

  // Fetch Occasions & Musics on Mount
  useEffect(() => {
    const initData = async () => {
      try {
        const occRes = await api.occasions.getOccasions();
        if (occRes.success && occRes.data) {
          setOccasionsList(occRes.data);
          // Set default occasion if not set
          if (occRes.data.length > 0 && !isEditMode) {
            const hasAnniversary = occRes.data.find(o => o.slug === 'anniversary');
            setOccasion(hasAnniversary ? 'anniversary' : occRes.data[0].slug);
          }
        }

        const musicRes = await api.musics.getMusics();
        if (musicRes.success && musicRes.data) {
          setSystemMusics(musicRes.data);
          // Default selection is none/empty string
        }
      } catch (e) {
        console.error("Error initializing options:", e);
      }
    };
    initData();
  }, [isEditMode]);

  // Fetch Themes filtered by Recipient & Occasion
  const fetchThemesList = useCallback(async () => {
    try {
      setLoadingThemes(true);
      const res = await api.themes.getThemes(
        showAllThemes ? undefined : recipientType,
        showAllThemes ? undefined : occasion
      );
      if (res.success && res.data) {
        setThemesList(res.data);
        // Automatically select first theme if current theme is not in the list
        if (res.data.length > 0) {
          const exists = res.data.some(t => t.key === theme);
          if (!exists) {
            setTheme(res.data[0].key);
          }
        }
      }
    } catch (e) {
      console.error("Error fetching themes:", e);
    } finally {
      setLoadingThemes(false);
    }
  }, [recipientType, occasion, showAllThemes, theme]);

  useEffect(() => {
    fetchThemesList();
  }, [fetchThemesList]);

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
              if (page.recipientType) setRecipientType(page.recipientType);
              if (page.occasion) setOccasion(page.occasion);

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
                const imgUrls = page.content.images || [];
                setExistingImages(imgUrls);
                if (page.content.mainImage) {
                  setMainImage(page.content.mainImage);
                  setUseMainImage(true);
                } else {
                  setMainImage('');
                  setUseMainImage(false);
                }

                const musicUrl = page.content.music || '';
                if (musicUrl) {
                  // Check if this music url is in systemMusics
                  const matchingSystemMusic = systemMusics.find(m => m.file === musicUrl);
                  if (matchingSystemMusic) {
                    setMusicSource('system');
                    setSelectedSystemMusicId(matchingSystemMusic._id);
                  } else {
                    setMusicSource('custom');
                    setExistingMusic(musicUrl);
                  }
                }
                setRecipient(page.content.recipient || '');
              }
            } else {
              setError('Không tìm thấy trang kỷ niệm cần sửa.');
            }
          }
        } catch (e) {
          setError('Lỗi khi tải thông tin trang kỷ niệm.');
        }
      };
      if (systemMusics.length > 0) {
        loadPageData();
      }
    }
  }, [id, isEditMode, systemMusics]);

  // Handle Recipient Type Selection (and prefill templates)
  const handleRecipientTypeChange = (type: RecipientType) => {
    setRecipientType(type);
    const template = EmotionalTemplates[type];
    if (template) {
      setTitle(template.titleSuggestions[0]);
      setHeroMessage(template.defaultHeroMessage);
      setLoveMessage(template.defaultEndingMessage);
      setMoments(template.momentsSuggestions.map(m => ({ ...m })));

      // Set default occasion based on recipient if possible
      if (type === 'LOVER' || type === 'SPOUSE') {
        setOccasion('anniversary');
      } else if (type === 'TEACHER') {
        setOccasion('thank_you');
      } else if (type === 'FAMILY' || type === 'MOTHER' || type === 'FATHER' || type === 'GRANDPARENT') {
        setOccasion('family_memory');
      } else {
        setOccasion('just_because');
      }
    }
  };

  const messages: string[] = [
    heroMessage,
    ...moments.map(m => `${m.title}||${m.content}`),
    loveMessage
  ];

  const handleNext = () => {
    if (currentStep === 1 && (!title.trim() || !recipient.trim())) {
      setError('Vui lòng nhập đầy đủ Tiêu đề và Tên người nhận.');
      return;
    }
    if (currentStep === 2) {
      if (!heroMessage.trim()) {
        setError('Vui lòng nhập lời nhắn mở đầu.');
        return;
      }
      if (moments.some(m => !m.title.trim() || !m.content.trim())) {
        setError('Vui lòng nhập đầy đủ tiêu đề và nội dung cho các khoảnh khắc.');
        return;
      }
      if (!loveMessage.trim()) {
        setError('Vui lòng nhập lời kết yêu thương.');
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
  const getFirstAvailableImage = (updatedExisting: string[], updatedPreviews: string[]) => {
    if (updatedExisting.length > 0) return updatedExisting[0];
    if (updatedPreviews.length > 0) return updatedPreviews[0];
    return '';
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const totalImages = selectedImages.length + filesArray.length + existingImages.length;

      if (totalImages > 13) {
        alert('Chỉ được tải lên tối đa 13 ảnh.');
        return;
      }

      const newSelected = [...selectedImages, ...filesArray];
      setSelectedImages(newSelected);

      const previews = filesArray.map(file => URL.createObjectURL(file));
      const newPreviews = [...imagePreviews, ...previews];
      setImagePreviews(newPreviews);

      if (useMainImage && !mainImage && (existingImages.length > 0 || newPreviews.length > 0)) {
        setMainImage(existingImages.length > 0 ? existingImages[0] : newPreviews[0]);
      }
    }
  };

  const handleRemoveNewImage = (index: number) => {
    const removedPreview = imagePreviews[index];
    const updatedSelected = selectedImages.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(updatedSelected);
    setImagePreviews(updatedPreviews);
    
    if (useMainImage && (mainImage === removedPreview || mainImage === 'new_first')) {
      setMainImage(getFirstAvailableImage(existingImages, updatedPreviews));
    } else if (!useMainImage) {
      setMainImage('');
    }
  };

  const handleRemoveExistingImage = (index: number) => {
    const removedUrl = existingImages[index];
    const updated = existingImages.filter((_, i) => i !== index);
    setExistingImages(updated);
    
    if (useMainImage && mainImage === removedUrl) {
      setMainImage(getFirstAvailableImage(updated, imagePreviews));
    } else if (!useMainImage) {
      setMainImage('');
    }
  };

  const handleSelectMainImage = (img: string, isExisting: boolean, index: number) => {
    if (!useMainImage) return;
    if (isExisting) {
      setMainImage(img);
    } else {
      const targetFile = selectedImages[index];
      const targetPreview = imagePreviews[index];
      const restFiles = selectedImages.filter((_, i) => i !== index);
      const restPreviews = imagePreviews.filter((_, i) => i !== index);
      
      setSelectedImages([targetFile, ...restFiles]);
      setImagePreviews([targetPreview, ...restPreviews]);
      setMainImage(targetPreview);
    }
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
      formData.append('recipientType', recipientType);
      formData.append('occasion', occasion);
      formData.append('status', 'PUBLISHED');

      if (pin) {
        formData.append('pin', pin);
      }

      // Determine final music path if system music selected
      let finalMusicUrl = "";
      if (musicSource === 'system') {
        const track = systemMusics.find(m => m._id === selectedSystemMusicId);
        if (track) {
          finalMusicUrl = track.file;
        }
      }

      let submitMainImage = useMainImage ? mainImage : '';
      if (useMainImage && imagePreviews.includes(mainImage)) {
        submitMainImage = 'new_first';
      }

      const contentJson = {
        messages: messages,
        recipient: recipient,
        occasion: occasionsList.find(o => o.slug === occasion)?.name || occasion, // compatible occasion name
        music: musicSource === 'system' ? finalMusicUrl : undefined,
        existingImages: existingImages,
        existingMusic: musicSource === 'system' ? "" : existingMusic,
        mainImage: submitMainImage
      };

      formData.append('content', JSON.stringify(contentJson));

      selectedImages.forEach(img => {
        formData.append('images', img);
      });

      if (musicSource === 'custom' && selectedMusic) {
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

  const recipients = [
    { type: 'LOVER', label: '❤️ Người yêu', desc: 'Lời ngọt ngào lãng mạn' },
    { type: 'MOTHER', label: '👩 Mẹ yêu', desc: 'Lòng biết ơn bao la' },
    { type: 'FATHER', label: '👨 Cha yêu', desc: 'Bờ vai vững chãi' },
    { type: 'SPOUSE', label: '💍 Vợ/Chồng', desc: 'Gắn bó trăm năm' },
    { type: 'FAMILY', label: '👨👩👧 Gia đình', desc: 'Tổ ấm yêu thương' },
    { type: 'GRANDPARENT', label: '👵 Ông bà', desc: 'Kính yêu vô bờ' },
    { type: 'FRIEND', label: '👭 Bạn thân', desc: 'Thanh xuân cùng nhau' },
    { type: 'TEACHER', label: '🎓 Thầy cô', desc: 'Tri ân trồng người' },
    { type: 'CHILD', label: '👶 Con cái', desc: 'Bình minh của cha mẹ' },
    { type: 'OTHER', label: '✨ Đối tượng khác', desc: 'Chia sẻ yêu thương' }
  ];

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
            currentStep === 1 ? 'Đối tượng & Dịp' :
              currentStep === 2 ? 'Lời nhắn gửi' :
                currentStep === 3 ? 'Ảnh kỷ niệm' :
                  currentStep === 4 ? 'Nhạc nền' :
                    currentStep === 5 ? 'Giao diện' :
                      currentStep === 6 ? 'Bảo mật' :
                        'Xác nhận'
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
      <div className="w-full glass-panel rounded-[32px] p-8 md:p-12 mb-8 min-h-[450px] flex flex-col justify-between shadow-lg bg-surface/80 backdrop-blur-md border border-white/20">

        {/* Step 1: Recipient & Occasion */}
        {currentStep === 1 && (
          <section className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="font-display text-h2 text-on-surface mb-2 font-bold">Bạn muốn gửi yêu thương tới ai?</h2>
              <p className="text-on-surface-variant font-body-md">Chọn đối tượng nhận và dịp đặc biệt để tạo lời chúc ý nghĩa nhất.</p>
            </div>

            <div className="space-y-6">
              {/* Recipient Type Grid */}
              <div>
                <label className="block font-label-caps text-xs text-primary mb-3 uppercase tracking-widest font-semibold">1. Đối tượng nhận quà</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                  {recipients.map((rec) => (
                    <button
                      key={rec.type}
                      type="button"
                      onClick={() => handleRecipientTypeChange(rec.type as RecipientType)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 hover:border-primary/50 ${
                        recipientType === rec.type
                          ? 'border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/20 scale-105'
                          : 'border-secondary-fixed bg-white/40 text-on-surface-variant'
                      }`}
                    >
                      <span className="text-base">{rec.label.split(' ')[0]}</span>
                      <span className="text-xs">{rec.label.split(' ').slice(1).join(' ')}</span>
                      <span className="text-[10px] text-on-surface-variant/70 font-normal leading-tight hidden sm:block">{rec.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Input fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block font-label-caps text-xs text-primary mb-2 uppercase tracking-widest font-semibold">Tên người nhận</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl border border-secondary-fixed bg-white/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md"
                    placeholder="Nhập tên người ấy (VD: Mẹ yêu, Bé Lan...)"
                    required
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-primary mb-2 uppercase tracking-widest font-semibold">Dịp sự kiện</label>
                  <select
                    value={occasion}
                    onChange={e => setOccasion(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl border border-secondary-fixed bg-white/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md cursor-pointer"
                  >
                    {occasionsList.map(occ => (
                      <option key={occ._id} value={occ.slug}>
                        {occ.icon} {occ.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="group pt-2">
                <label className="block font-label-caps text-xs text-primary mb-2 uppercase tracking-widest font-semibold">Tiêu đề trang kỷ niệm</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl border border-secondary-fixed bg-white/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-lg text-on-surface font-medium"
                  placeholder="Tiêu đề mẫu..."
                  required
                />
              </div>
            </div>
          </section>
        )}

        {/* Step 2: Messages */}
        {currentStep === 2 && (
          <section className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="font-display text-h2 text-on-surface mb-2 font-bold">Viết lời nhắn gửi</h2>
              <p className="text-on-surface-variant font-body-md">Những câu chúc ấm áp sẽ dẫn dắt câu chuyện kỉ niệm đầy cảm xúc.</p>
            </div>

            <div className="space-y-5 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
              {/* Section 1: Intro Message */}
              <div className="p-5 border border-secondary-fixed rounded-2xl bg-white/30">
                <span className="font-label-caps text-[10px] text-primary uppercase font-bold block mb-2">1. Lời chúc mở đầu</span>
                <textarea
                  value={heroMessage}
                  onChange={e => setHeroMessage(e.target.value)}
                  className="w-full h-24 p-3 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-on-surface-variant font-body-md"
                  placeholder="Mẹ yêu, ngày hôm nay con muốn nói một điều..."
                />
              </div>

              {/* Section 2-3: Moments */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-[10px] text-secondary uppercase font-bold block">2. Những chương câu chuyện kỷ niệm</span>
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
                  <div key={index} className="p-5 border border-secondary-fixed rounded-2xl bg-white/30 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-label-caps text-[10px] text-secondary uppercase font-bold">Khoảnh khắc {index + 1}</span>
                      {moments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMoment(index)}
                          className="text-error hover:bg-error-container/20 p-1.5 rounded-lg transition-all"
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
                        placeholder="Tiêu đề khoảnh khắc (VD: Bữa cơm ấm áp, Ngày đầu tiên...)"
                      />
                      <textarea
                        value={moment.content}
                        onChange={e => handleMomentChange(index, 'content', e.target.value)}
                        className="w-full h-20 p-3 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-on-surface-variant font-body-md"
                        placeholder="Nội dung khoảnh khắc thân thương..."
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Section 4: Ending Message */}
              <div className="p-5 border border-secondary-fixed rounded-2xl bg-white/30">
                <span className="font-label-caps text-[10px] text-error uppercase font-bold block mb-2">3. Lời kết yêu thương</span>
                <textarea
                  value={loveMessage}
                  onChange={e => setLoveMessage(e.target.value)}
                  className="w-full h-24 p-3 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-on-surface-variant font-body-md font-handwriting text-lg"
                  placeholder="Con chúc mẹ luôn an vui. Con yêu mẹ nhiều!"
                />
              </div>
            </div>
          </section>
        )}

        {/* Step 3: Images */}
        {currentStep === 3 && (
          <section className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-display text-h2 text-on-surface mb-2 font-bold">Hình ảnh kỷ niệm</h2>
                <p className="text-on-surface-variant font-body-md">Tải lên các hình ảnh đẹp chứa đựng kỷ niệm của hai người (Tối đa 13 ảnh).</p>
              </div>
              <span className="font-label-caps text-xs text-primary px-3 py-1 bg-primary-fixed/40 rounded-full font-bold">
                Đã chọn: {selectedImages.length + existingImages.length}/13
              </span>
            </div>

            {/* Toggle main image */}
            <div className="bg-white/40 p-4 rounded-2xl border border-secondary-fixed flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">photo_library</span>
                <div className="text-left">
                  <p className="font-body-md font-bold text-on-surface">Sử dụng ảnh bìa chính (Hero Image)</p>
                  <p className="text-xs text-on-surface-variant">Hiển thị một ảnh nổi bật ở đầu trang làm nền lời chúc</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useMainImage}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setUseMainImage(checked);
                    if (checked) {
                      if (!mainImage && (existingImages.length > 0 || imagePreviews.length > 0)) {
                        setMainImage(existingImages.length > 0 ? existingImages[0] : imagePreviews[0]);
                      }
                    } else {
                      setMainImage('');
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
              {existingImages.map((imgUrl, index) => {
                const isMain = useMainImage && mainImage === imgUrl;
                return (
                  <div key={`existing-${index}`} className={`relative aspect-square rounded-2xl overflow-hidden shadow-sm group border transition-all ${isMain ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'}`}>
                    <img src={imgUrl} alt="Existing" className="w-full h-full object-cover" />
                    
                    {/* Main Image Badge */}
                    {isMain && (
                      <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-md z-10">
                        <span className="material-symbols-outlined text-[12px] font-bold">star</span>
                        <span>Ảnh chính</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity z-10">
                      {useMainImage && !isMain && (
                        <button
                          type="button"
                          onClick={() => handleSelectMainImage(imgUrl, true, index)}
                          className="p-2 bg-white/90 hover:bg-white text-primary rounded-full shadow-md transition-all"
                          title="Đặt làm ảnh chính"
                        >
                          <span className="material-symbols-outlined text-sm font-bold">star</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(index)}
                        className="p-2 bg-error hover:bg-error/90 text-white rounded-full shadow-md transition-all"
                        title="Xóa ảnh"
                      >
                        <span className="material-symbols-outlined text-sm font-bold">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {imagePreviews.map((previewUrl, index) => {
                const isMain = useMainImage && mainImage === previewUrl;
                return (
                  <div key={`new-${index}`} className={`relative aspect-square rounded-2xl overflow-hidden shadow-sm group border transition-all ${isMain ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'}`}>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    
                    {/* Main Image Badge */}
                    {isMain && (
                      <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-md z-10">
                        <span className="material-symbols-outlined text-[12px] font-bold">star</span>
                        <span>Ảnh chính</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity z-10">
                      {useMainImage && !isMain && (
                        <button
                          type="button"
                          onClick={() => handleSelectMainImage(previewUrl, false, index)}
                          className="p-2 bg-white/90 hover:bg-white text-primary rounded-full shadow-md transition-all"
                          title="Đặt làm ảnh chính"
                        >
                          <span className="material-symbols-outlined text-sm font-bold">star</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="p-2 bg-error hover:bg-error/90 text-white rounded-full shadow-md transition-all"
                        title="Xóa ảnh"
                      >
                        <span className="material-symbols-outlined text-sm font-bold">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {selectedImages.length + existingImages.length < 13 && (
                <label className="aspect-square border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-primary text-3xl">add_a_photo</span>
                  <span className="font-label-caps text-[10px] text-primary uppercase text-center px-4 font-bold">Thêm ảnh</span>
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
          <section className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="font-display text-h2 text-on-surface mb-2 font-bold">Chọn nhạc nền</h2>
              <p className="text-on-surface-variant font-body-md">Nhạc nền du dương tăng thêm phần xúc động khi đọc trang kỷ niệm.</p>
            </div>

            <div className="space-y-6">
              {/* Music Source Tabs */}
              <div className="flex border-b border-secondary-container/10 pb-1">
                <button
                  type="button"
                  onClick={() => setMusicSource('system')}
                  className={`px-6 py-2.5 font-label-caps text-xs tracking-wider uppercase font-semibold transition-all border-b-2 ${
                    musicSource === 'system'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Kho nhạc hệ thống
                </button>
                <button
                  type="button"
                  onClick={() => setMusicSource('custom')}
                  className={`px-6 py-2.5 font-label-caps text-xs tracking-wider uppercase font-semibold transition-all border-b-2 ${
                    musicSource === 'custom'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Tải nhạc riêng lên
                </button>
              </div>

              {musicSource === 'system' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {/* Option: No background music */}
                  <div
                    onClick={() => setSelectedSystemMusicId('')}
                    className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-center gap-4 hover:border-primary/50 ${
                      selectedSystemMusicId === ''
                        ? 'border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/20'
                        : 'border-secondary-fixed bg-white/40 text-on-surface-variant'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                      <span className="material-symbols-outlined">music_off</span>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-body-md font-semibold truncate text-on-surface">Không dùng nhạc nền</p>
                      <p className="text-xs text-on-surface-variant truncate font-normal">Không phát nhạc khi xem trang</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0">
                      {selectedSystemMusicId === '' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>

                  {systemMusics.map((musicItem) => (
                    <div
                      key={musicItem._id}
                      onClick={() => setSelectedSystemMusicId(musicItem._id)}
                      className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-center gap-4 hover:border-primary/50 ${
                        selectedSystemMusicId === musicItem._id
                          ? 'border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/20'
                          : 'border-secondary-fixed bg-white/40 text-on-surface-variant'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined">music_note</span>
                      </div>
                      <div className="flex-1 min-w-0 text-left font-normal">
                        <p className="font-body-md font-semibold truncate text-on-surface">{musicItem.name}</p>
                        <p className="text-xs text-on-surface-variant truncate">{musicItem.artist || "Nghệ sĩ ẩn danh"}</p>
                      </div>
                      <button
                        type="button"
                        title="Nghe thử"
                        onClick={(e) => { e.stopPropagation(); previewSystemMusic(musicItem.file); }}
                        className="flex w-9 h-9 rounded-full bg-primary/10 text-primary items-center justify-center hover:bg-primary hover:text-on-primary transition-all active:scale-95"
                      >
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {previewingMusic === musicItem.file ? 'pause' : 'play_arrow'}
                        </span>
                      </button>
                      <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0">
                        {selectedSystemMusicId === musicItem._id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {musicSource === 'custom' && (
                <div className="space-y-6">
                  {existingMusic && (
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-primary">
                        <span className="material-symbols-outlined">music_note</span>
                        <span className="text-xs font-semibold truncate max-w-[300px]">Đã tải nhạc lên trước đó</span>
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
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-primary">
                        <span className="material-symbols-outlined">music_note</span>
                        <span className="text-xs font-semibold truncate max-w-[300px]">{musicPreviewName}</span>
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
                        <div className="text-center">
                          <h3 className="font-body-lg font-bold text-on-surface mb-1">Tải file nhạc lên</h3>
                          <p className="font-caption text-xs text-on-surface-variant">Hỗ trợ tệp MP3, WAV dung lượng nhỏ hơn 20MB</p>
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
              )}
            </div>
          </section>
        )}

        {/* Step 5: Themes */}
        {currentStep === 5 && (
          <section className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-start flex-col sm:flex-row sm:items-end">
              <div>
                <h2 className="font-display text-h2 text-on-surface mb-2 font-bold">Chủ đề giao diện</h2>
                <p className="text-on-surface-variant font-body-md">Bộ lọc hiển thị những chủ đề tối ưu nhất cho đối tượng và dịp kỷ niệm.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAllThemes(p => !p)}
                className="mt-3 sm:mt-0 font-label-caps text-xs text-primary bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 font-bold transition-all"
              >
                {showAllThemes ? "Hiển thị gợi ý" : "Hiển thị tất cả chủ đề"}
              </button>
            </div>

            {loadingThemes ? (
              <div className="flex flex-col items-center justify-center py-10">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
                <p className="text-xs text-on-surface-variant mt-3">Đang tải danh sách chủ đề...</p>
              </div>
            ) : themesList.length === 0 ? (
              <div className="text-center py-10 p-6 border rounded-2xl bg-white/40 space-y-4">
                <span className="material-symbols-outlined text-4xl text-primary">search_off</span>
                <p className="text-on-surface-variant font-body-md">Không tìm thấy theme nào khớp với bộ lọc gợi ý.</p>
                <button
                  type="button"
                  onClick={() => setShowAllThemes(true)}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-semibold shadow-md"
                >
                  Xem tất cả các chủ đề
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                {themesList.map((t) => (
                  <div
                    key={t._id}
                    onClick={() => setTheme(t.key)}
                    className={`p-5 border rounded-3xl cursor-pointer transition-all flex flex-col justify-between hover:border-primary/50 relative overflow-hidden ${
                      theme === t.key
                        ? 'border-primary bg-primary/5 ring-4 ring-primary/10 scale-[1.02]'
                        : 'border-secondary-fixed bg-white/40'
                    }`}
                  >
                    <div>
                      {/* Color dots */}
                      <div className="flex gap-1.5 mb-3">
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block" style={{ backgroundColor: t.primaryColor }} />
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block" style={{ backgroundColor: t.secondaryColor }} />
                      </div>
                      <h3 className="font-body-lg font-bold text-on-surface">{t.name}</h3>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{t.description}</p>
                    </div>

                    <div className="pt-4 flex items-center justify-between text-[10px] text-on-surface-variant font-medium">
                      <span className="bg-secondary-fixed/50 px-2 py-0.5 rounded-full">
                        {(t.category && typeof t.category === 'object') ? t.category.name : 'Category'}
                      </span>
                      {t.animation !== 'none' && (
                        <span className="flex items-center gap-0.5 text-primary">
                          <span className="material-symbols-outlined text-xs">celebration</span>
                          {t.animation}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}


          </section>
        )}

        {/* Step 6: Security */}
        {currentStep === 6 && (
          <section className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="font-display text-h2 text-on-surface mb-2 font-bold">Mã PIN bảo mật</h2>
              <p className="text-on-surface-variant font-body-md">Bảo vệ riêng tư. Người nhận cần có mã PIN này mới có thể mở xem kỷ niệm.</p>
            </div>

            <div className="max-w-md mx-auto space-y-4 pt-4">
              <div className="group text-center">
                <label className="block font-label-caps text-xs text-primary mb-3 uppercase tracking-widest font-semibold">Nhập mã PIN (4 đến 6 chữ số)</label>
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full max-w-[280px] px-6 py-4 rounded-2xl border border-secondary-fixed bg-white/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-center font-bold text-h2 tracking-[0.8em]"
                  placeholder="••••"
                  required
                />
              </div>
              <p className="text-xs text-on-surface-variant text-center italic">Chỉ cho phép các chữ số từ 0 đến 9.</p>
            </div>
          </section>
        )}

        {/* Step 7: Summary / Confirmation */}
        {currentStep === 7 && (
          <section className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="font-display text-h2 text-on-surface mb-2 font-bold">Sẵn sàng xuất bản</h2>
              <p className="text-on-surface-variant font-body-md">Kiểm tra lại tóm tắt thông tin trang kỷ niệm trước khi xuất bản trực tuyến.</p>
            </div>

            <div className="space-y-4 font-body-md text-on-surface-variant p-6 border border-secondary-fixed rounded-3xl bg-white/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-secondary-container/10">
                <div>
                  <span className="font-bold text-xs uppercase tracking-wider block text-primary">Tiêu đề kỷ niệm</span>
                  <span className="text-on-surface text-lg font-medium">{title}</span>
                </div>
                <div>
                  <span className="font-bold text-xs uppercase tracking-wider block text-primary">Người nhận</span>
                  <span className="text-on-surface text-lg font-medium">{recipient} ({recipients.find(r => r.type === recipientType)?.label.split(' ').slice(1).join(' ') || recipientType})</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pb-4 border-b border-secondary-container/10">
                <div>
                  <span className="font-bold text-xs block text-primary uppercase">Dịp kỷ niệm</span>
                  <span className="text-on-surface font-medium capitalize">
                    {occasionsList.find(o => o.slug === occasion)?.name || occasion}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-xs block text-primary uppercase">Chủ đề (Theme)</span>
                  <span className="text-on-surface font-medium capitalize">
                    {theme}
                  </span>
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
                  <span className="font-bold text-xs block text-primary uppercase">Âm nhạc nền</span>
                  <span className="text-on-surface font-medium">
                    {musicSource === 'system'
                      ? `Nhạc hệ thống: ${systemMusics.find(m => m._id === selectedSystemMusicId)?.name || 'Đã chọn'}`
                      : selectedMusic || existingMusic
                        ? 'Nhạc tải lên tùy chọn'
                        : 'Không có'}
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
                  Đang lưu...
                </>
              ) : (
                'Xuất bản ngay'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Success step modal */}
      {currentStep === 8 && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-lg bg-surface rounded-[2rem] p-8 md:p-12 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto animate-bounce">
              <span className="material-symbols-outlined text-4xl font-bold">celebration</span>
            </div>

            <div className="space-y-2">
              <h2 className="font-h2 text-h2 text-on-surface font-bold">Tạo trang thành công!</h2>
              <p className="font-body-md text-on-surface-variant text-sm">
                Món quà yêu thương ý nghĩa của bạn đã sẵn sàng được trao đi.
              </p>
            </div>

            <div className="bg-surface-container-low p-5 rounded-2xl border border-secondary-container/10 text-left">
              <span className="text-xs text-on-surface-variant block mb-1 font-semibold uppercase tracking-wider text-primary">Liên kết chia sẻ</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/api/share/${createdSlug}`}
                  className="flex-1 px-4 py-2 border rounded-xl bg-white text-xs select-all text-on-surface-variant font-mono outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/api/share/${createdSlug}`);
                    alert('Đã sao chép liên kết chia sẻ!');
                  }}
                  className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-semibold"
                >
                  Sao chép
                </button>
              </div>
              <p className="text-[10px] text-on-surface-variant/80 mt-2 italic">
                * Lưu ý: Đường dẫn /api/share/ hỗ trợ hiển thị ảnh và lời chúc xem trước sinh động trên Facebook và Zalo.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <button
                onClick={() => {
                  window.open(`/page/${createdSlug}`, '_blank');
                }}
                className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-semibold text-sm shadow-md"
              >
                Mở xem trực tiếp trang
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
