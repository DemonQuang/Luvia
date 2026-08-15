import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AudioPreviewButton } from '../../components/ui/AudioPreviewButton';
import api from '../../services/api';
import { User, ThemeCategory, Occasion, Theme, Music, AdminStats, LovePage } from '../../types';

const BACKGROUND_PRESETS = [
  {
    name: 'Blush Dream (Yêu cầu)',
    background: 'linear-gradient(to bottom, #ffd6ec, #ffb8da)',
    primaryColor: '#ff5e9c',
    secondaryColor: '#ff8fab'
  },
  {
    name: 'Soft Pink (Mặc định)',
    background: 'linear-gradient(to bottom, #ffeef8, #ffd3eb)',
    primaryColor: '#ff5e9c',
    secondaryColor: '#f1c40f'
  },
  {
    name: 'Sunset Rose',
    background: 'linear-gradient(to bottom, #ffe3e3, #ffb3b3)',
    primaryColor: '#e74c3c',
    secondaryColor: '#f1c40f'
  },
  {
    name: 'Sky Breeze',
    background: 'linear-gradient(to bottom, #e0f2fe, #bae6fd)',
    primaryColor: '#0284c7',
    secondaryColor: '#38bdf8'
  },
  {
    name: 'Cozy Lavender',
    background: 'linear-gradient(to bottom, #f3e8ff, #e9d5ff)',
    primaryColor: '#9333ea',
    secondaryColor: '#c084fc'
  },
  {
    name: 'Midnight Dark',
    background: '#1a1a2e',
    primaryColor: '#a29bfe',
    secondaryColor: '#ffeaa7'
  }
];

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'themes' | 'categories' | 'occasions' | 'music' | 'pages' | 'users'>('dashboard');

  // Stats
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Entities lists
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<ThemeCategory[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [musics, setMusics] = useState<Music[]>([]);
  const [pages, setPages] = useState<LovePage[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal / Form States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'theme' | 'category' | 'occasion' | 'music'>('theme');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('');
  const [categoryOrder, setCategoryOrder] = useState(0);
  const [categoryStatus, setCategoryStatus] = useState<'active' | 'inactive'>('active');

  const [occasionName, setOccasionName] = useState('');
  const [occasionSlug, setOccasionSlug] = useState('');
  const [occasionIcon, setOccasionIcon] = useState('');
  const [occasionDesc, setOccasionDesc] = useState('');
  const [occasionOrder, setOccasionOrder] = useState(0);
  const [occasionStatus, setOccasionStatus] = useState<'active' | 'inactive'>('active');

  const [themeName, setThemeName] = useState('');
  const [themeKey, setThemeKey] = useState('');
  const [themeDesc, setThemeDesc] = useState('');
  const [themeCategory, setThemeCategory] = useState('');
  const [themeRecipients, setThemeRecipients] = useState<string[]>([]);
  const [themeOccasions, setThemeOccasions] = useState<string[]>([]);
  const [themePrimary, setThemePrimary] = useState('#ff5e9c');
  const [themeSecondary, setThemeSecondary] = useState('#f1c40f');
  const [themeBg, setThemeBg] = useState('');
  const [themeFont, setThemeFont] = useState('Inter');
  const [themeAnim, setThemeAnim] = useState('none');
  const [themeMusic, setThemeMusic] = useState('');
  const [themeLayout, setThemeLayout] = useState('classic');
  const [themeGalleryLayout, setThemeGalleryLayout] = useState('cosmic');
  const [themeLetterLayout, setThemeLetterLayout] = useState('flowers');
  const [themeStatus, setThemeStatus] = useState<'draft' | 'published' | 'disabled'>('draft');
  const [themeThumbFile, setThemeThumbFile] = useState<File | null>(null);
  const [themePrevFile, setThemePrevFile] = useState<File | null>(null);

  const [musicName, setMusicName] = useState('');
  const [musicArtist, setMusicArtist] = useState('');
  const [musicDuration, setMusicDuration] = useState(0);
  const [musicCategory, setMusicCategory] = useState('general');
  const [musicStatus, setMusicStatus] = useState<'active' | 'inactive'>('active');
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [musicThumbFile, setMusicThumbFile] = useState<File | null>(null);
  const [musicFileUrl, setMusicFileUrl] = useState('');
  const [musicThumbnailUrl, setMusicThumbnailUrl] = useState('');

  const musicAudioPreviewSrc = musicFile
    ? URL.createObjectURL(musicFile)
    : (musicFileUrl || '');

  const isSupportedAudioUrl = (url: string): boolean => {
    if (!url) return true;
    try {
      const parsed = new URL(url, window.location.href);
      const ext = parsed.pathname.split('.').pop()?.toLowerCase() || '';
      return ['mp3', 'wav', 'ogg', 'oga', 'm4a', 'flac', 'aac', 'weba'].includes(ext);
    } catch {
      return false;
    }
  };
  const invalidAudioUrl = musicFileUrl.trim() !== '' && !isSupportedAudioUrl(musicFileUrl.trim());

  // Free music states
  const [showFreeMusicModal, setShowFreeMusicModal] = useState(false);
  const [freeMusicQuery, setFreeMusicQuery] = useState('');
  const [freeMusicResults, setFreeMusicResults] = useState<any[]>([]);
  const [freeMusicSearching, setFreeMusicSearching] = useState(false);
  const [freeMusicCategory, setFreeMusicCategory] = useState('general');
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

  const handlePlayClip = (clip: any) => {
    if (previewAudio) {
      previewAudio.pause();
    }

    const clipId = clip.id || clip.clip_id;
    if (playingClipId === clipId) {
      setPlayingClipId(null);
      setPreviewAudio(null);
      return;
    }

    const audioUrl = clip.fileUrl;
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audio.play().catch(err => console.error("Error playing audio:", err));
    setPreviewAudio(audio);
    setPlayingClipId(clipId);

    audio.onended = () => {
      setPlayingClipId(null);
      setPreviewAudio(null);
    };
  };

  // Load Data based on Active Tab
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        setStatsLoading(true);
        const res = await api.admin.getDashboardStats();
        if (res.success) setStats(res.data);
        setStatsLoading(false);
      } else if (activeTab === 'users') {
        const res = await api.auth.getAdminUsers();
        if (res.success) setUsers(res.users);
      } else if (activeTab === 'categories') {
        const res = await api.themeCategories.getAdminCategories();
        if (res.success) setCategories(res.data);
      } else if (activeTab === 'occasions') {
        const res = await api.occasions.getAdminOccasions();
        if (res.success) setOccasions(res.data);
      } else if (activeTab === 'themes') {
        // Fetch categories & occasions for dropdown filters/assigns
        const catRes = await api.themeCategories.getAdminCategories();
        if (catRes.success) setCategories(catRes.data);
        const occRes = await api.occasions.getAdminOccasions();
        if (occRes.success) setOccasions(occRes.data);

        const res = await api.themes.getAdminThemes();
        if (res.success) setThemes(res.data);
      } else if (activeTab === 'music') {
        const res = await api.musics.getAdminMusics();
        if (res.success) setMusics(res.data);
      } else if (activeTab === 'pages') {
        const res = await api.admin.getPages();
        if (res.success) setPages(res.data);
      }
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Recipient Types constants
  const allRecipients = ['LOVER', 'MOTHER', 'FATHER', 'SPOUSE', 'FAMILY', 'GRANDPARENT', 'FRIEND', 'CHILD', 'TEACHER', 'OTHER'];
  const allFonts = ['Inter', 'Playfair Display', 'Dancing Script', 'Pacifico', 'Outfit'];
  const allAnimations = ['none', 'heart', 'snow', 'flower', 'leaf', 'bubble', 'confetti', 'sparkle', 'light'];
  const allLayouts = ['classic', 'timeline', 'split'];

  // Delete User Action
  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tài khoản "${name}"? Các trang kỷ niệm liên quan sẽ bị xóa sạch.`)) return;
    try {
      const res = await api.auth.deleteAdminUser(id);
      if (res.success) {
        setUsers(prev => prev.filter(u => u.id !== id));
        alert('Đã xóa thành công!');
      }
    } catch (e: any) {
      alert(e.message || 'Lỗi khi xóa tài khoản');
    }
  };

  // Delete Page Action
  const handleDeletePage = async (id: string, slug: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn trang kỷ niệm "${slug}"?`)) return;
    try {
      const res = await api.admin.deletePage(id);
      if (res.success) {
        setPages(prev => prev.filter(p => p._id !== id));
        alert('Đã xóa thành công!');
      }
    } catch (e: any) {
      alert(e.message || 'Lỗi khi xóa trang');
    }
  };

  // Update Page Status
  const handleUpdatePageStatus = async (id: string, status: string) => {
    try {
      const res = await api.admin.updatePageStatus(id, status);
      if (res.success) {
        setPages(prev => prev.map(p => p._id === id ? { ...p, status: status as any } : p));
        alert(`Đã đổi trạng thái trang thành ${status}`);
      }
    } catch (e: any) {
      alert(e.message || 'Lỗi khi đổi trạng thái');
    }
  };

  // Category CRUD Submit
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: categoryName,
      slug: categorySlug,
      icon: categoryIcon,
      displayOrder: categoryOrder,
      status: categoryStatus
    };

    try {
      let res;
      if (editingId) {
        res = await api.themeCategories.updateCategory(editingId, data);
      } else {
        res = await api.themeCategories.createCategory(data);
      }
      if (res.success) {
        alert(editingId ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        setShowModal(false);
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra.');
    }
  };

  // Occasion CRUD Submit
  const handleOccasionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: occasionName,
      slug: occasionSlug,
      icon: occasionIcon,
      description: occasionDesc,
      displayOrder: occasionOrder,
      status: occasionStatus
    };

    try {
      let res;
      if (editingId) {
        res = await api.occasions.updateOccasion(editingId, data);
      } else {
        res = await api.occasions.createOccasion(data);
      }
      if (res.success) {
        alert(editingId ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        setShowModal(false);
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra.');
    }
  };

  // Theme CRUD Submit
  const handleThemeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', themeName);
    formData.append('key', themeKey);
    formData.append('description', themeDesc);
    formData.append('category', themeCategory);
    formData.append('supportedRecipientTypes', JSON.stringify(themeRecipients));
    formData.append('supportedOccasions', JSON.stringify(themeOccasions));
    formData.append('primaryColor', themePrimary);
    formData.append('secondaryColor', themeSecondary);
    formData.append('background', themeBg);
    formData.append('font', themeFont);
    formData.append('animation', themeAnim);
    formData.append('defaultMusic', themeMusic);
    formData.append('layout', themeLayout);
    formData.append('galleryLayout', themeGalleryLayout);
    formData.append('letterLayout', themeLetterLayout);
    formData.append('status', themeStatus);

    if (themeThumbFile) formData.append('thumbnail', themeThumbFile);
    if (themePrevFile) formData.append('preview', themePrevFile);

    try {
      let res;
      if (editingId) {
        res = await api.themes.updateTheme(editingId, formData);
      } else {
        res = await api.themes.createTheme(formData);
      }
      if (res.success) {
        alert(editingId ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        setShowModal(false);
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi lưu theme.');
    }
  };

  // Music CRUD Submit
  const handleMusicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (invalidAudioUrl) {
      alert('Đường dẫn âm thanh không hợp lệ. Vui lòng nhập URL tệp âm thanh trực tiếp (mp3, wav, ogg...) hoặc tải tệp từ máy tính.');
      return;
    }
    const formData = new FormData();
    formData.append('name', musicName);
    formData.append('artist', musicArtist);
    formData.append('duration', String(musicDuration));
    formData.append('category', musicCategory);
    formData.append('status', musicStatus);

    if (musicFile) formData.append('file', musicFile);
    if (musicThumbFile) formData.append('thumbnail', musicThumbFile);
    if (musicFileUrl) formData.append('fileUrl', musicFileUrl);
    if (musicThumbnailUrl) formData.append('thumbnailUrl', musicThumbnailUrl);

    try {
      let res;
      if (editingId) {
        res = await api.musics.updateMusic(editingId, formData);
      } else {
        if (!musicFile && !musicFileUrl) {
          alert('Vui lòng chọn tệp âm thanh tải lên hoặc nhập đường dẫn nhạc URL.');
          return;
        }
        res = await api.musics.createMusic(formData);
      }
      if (res.success) {
        alert(editingId ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        setShowModal(false);
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi lưu nhạc.');
    }
  };

  const handleSearchFreeMusic = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFreeMusicSearching(true);
    try {
      const res = await api.musics.searchFreeMusics(freeMusicQuery);
      if (res.success) {
        setFreeMusicResults(res.data || []);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi tìm nhạc.');
    } finally {
      setFreeMusicSearching(false);
    }
  };

  const handleSaveFreeMusicToLibrary = async (track: any) => {
    try {
      const formData = new FormData();
      formData.append('name', track.name);
      formData.append('artist', track.artist || 'Unknown');
      formData.append('duration', String(track.duration || 0));
      formData.append('category', freeMusicCategory);
      formData.append('status', 'active');
      formData.append('fileUrl', track.fileUrl);
      if (track.thumbnailUrl) {
        formData.append('thumbnailUrl', track.thumbnailUrl);
      }

      const res = await api.musics.createMusic(formData);
      if (res.success) {
        alert(`Đã lưu bài hát "${track.name}" vào thư viện!`);
        setShowFreeMusicModal(false);
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi lưu nhạc vào thư viện.');
    }
  };

  // Stop playing preview when modal is closed or load initial popular music
  useEffect(() => {
    if (showFreeMusicModal) {
      handleSearchFreeMusic();
    }
  }, [showFreeMusicModal]);

  // Delete category/occasion/theme/music
  const handleDeleteEntity = async (type: string, id: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bản ghi này?`)) return;
    try {
      let res;
      if (type === 'category') res = await api.themeCategories.deleteCategory(id);
      else if (type === 'occasion') res = await api.occasions.deleteOccasion(id);
      else if (type === 'theme') res = await api.themes.deleteTheme(id);
      else if (type === 'music') res = await api.musics.deleteMusic(id);

      if (res && res.success) {
        alert('Đã xóa thành công!');
        fetchData();
      }
    } catch (e: any) {
      alert('Không thể xóa do ràng buộc dữ liệu hoặc lỗi kết nối.');
    }
  };

  // Open Modal Helpers
  const openCategoryModal = (cat?: ThemeCategory) => {
    setModalType('category');
    if (cat) {
      setEditingId(cat._id);
      setCategoryName(cat.name);
      setCategorySlug(cat.slug);
      setCategoryIcon(cat.icon || '');
      setCategoryOrder(cat.displayOrder || 0);
      setCategoryStatus(cat.status);
    } else {
      setEditingId(null);
      setCategoryName('');
      setCategorySlug('');
      setCategoryIcon('');
      setCategoryOrder(0);
      setCategoryStatus('active');
    }
    setShowModal(true);
  };

  const openOccasionModal = (occ?: Occasion) => {
    setModalType('occasion');
    if (occ) {
      setEditingId(occ._id);
      setOccasionName(occ.name);
      setOccasionSlug(occ.slug);
      setOccasionIcon(occ.icon || '');
      setOccasionDesc(occ.description || '');
      setOccasionOrder(occ.displayOrder || 0);
      setOccasionStatus(occ.status);
    } else {
      setEditingId(null);
      setOccasionName('');
      setOccasionSlug('');
      setOccasionIcon('');
      setOccasionDesc('');
      setOccasionOrder(0);
      setOccasionStatus('active');
    }
    setShowModal(true);
  };

  const openThemeModal = (t?: Theme) => {
    setModalType('theme');
    if (t) {
      setEditingId(t._id);
      setThemeName(t.name);
      setThemeKey(t.key);
      setThemeDesc(t.description || '');
      setThemeCategory((t.category && typeof t.category === 'object') ? t.category._id : (t.category || ''));
      setThemeRecipients(t.supportedRecipientTypes);
      setThemeOccasions((t.supportedOccasions as any[]).map(o => (o && typeof o === 'object') ? o._id : (o || '')));
      setThemePrimary(t.primaryColor || '#ff5e9c');
      setThemeSecondary(t.secondaryColor || '#f1c40f');
      setThemeBg(t.background || '');
      setThemeFont(t.font || 'Inter');
      setThemeAnim(t.animation || 'none');
      setThemeMusic(t.defaultMusic || '');
      setThemeLayout(t.layout || 'classic');
      setThemeGalleryLayout(t.galleryLayout || 'cosmic');
      setThemeLetterLayout(t.letterLayout || 'flowers');
      setThemeStatus(t.status);
    } else {
      setEditingId(null);
      setThemeName('');
      setThemeKey('');
      setThemeDesc('');
      setThemeCategory(categories[0]?._id || '');
      setThemeRecipients([]);
      setThemeOccasions([]);
      setThemePrimary('#ff5e9c');
      setThemeSecondary('#f1c40f');
      setThemeBg('linear-gradient(to bottom, #ffeef8, #ffd3eb)');
      setThemeFont('Inter');
      setThemeAnim('none');
      setThemeMusic('');
      setThemeLayout('classic');
      setThemeGalleryLayout('cosmic');
      setThemeLetterLayout('flowers');
      setThemeStatus('draft');
    }
    setThemeThumbFile(null);
    setThemePrevFile(null);
    setShowModal(true);
  };

  const openMusicModal = (m?: Music) => {
    setModalType('music');
    if (m) {
      setEditingId(m._id);
      setMusicName(m.name);
      setMusicArtist(m.artist || '');
      setMusicDuration(m.duration || 0);
      setMusicCategory(m.category || 'general');
      setMusicStatus(m.status);
      setMusicFileUrl(m.file || '');
      setMusicThumbnailUrl(m.thumbnail || '');
    } else {
      setEditingId(null);
      setMusicName('');
      setMusicArtist('');
      setMusicDuration(0);
      setMusicCategory('general');
      setMusicStatus('active');
      setMusicFileUrl('');
      setMusicThumbnailUrl('');
    }
    setMusicFile(null);
    setMusicThumbFile(null);
    setShowModal(true);
  };

  // Toggle recipients and occasions inside lists
  const toggleRecipientType = (type: string) => {
    if (themeRecipients.includes(type)) {
      setThemeRecipients(prev => prev.filter(r => r !== type));
    } else {
      setThemeRecipients(prev => [...prev, type]);
    }
  };

  const toggleOccasion = (id: string) => {
    if (themeOccasions.includes(id)) {
      setThemeOccasions(prev => prev.filter(o => o !== id));
    } else {
      setThemeOccasions(prev => [...prev, id]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-h1 text-on-surface mb-2 font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">admin_panel_settings</span>
            Quản trị Luvia
          </h1>
          <p className="font-body-md text-on-surface-variant">Bảng điều khiển quản lý và điều hành các tài nguyên hệ thống Luvia.</p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex gap-2 border-b border-secondary-container/10 overflow-x-auto pb-1 custom-scrollbar">
        {[
          { id: 'dashboard', label: 'Tổng quan', icon: 'dashboard' },
          { id: 'themes', label: 'Theme Giao diện', icon: 'palette' },
          { id: 'categories', label: 'Danh mục', icon: 'category' },
          { id: 'occasions', label: 'Dịp sự kiện', icon: 'event' },
          { id: 'music', label: 'Nhạc nền', icon: 'music_note' },
          { id: 'pages', label: 'Kỷ niệm Pages', icon: 'web' },
          { id: 'users', label: 'Người dùng', icon: 'group' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary text-on-primary shadow-md'
                : 'text-on-surface-variant hover:bg-primary/5 hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {loading && activeTab !== 'dashboard' ? (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
          <p className="text-on-surface-variant text-xs mt-3">Đang tải dữ liệu quản trị...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: DASHBOARD STATS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {statsLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
                  <p className="text-on-surface-variant text-xs mt-3">Đang kết xuất số liệu...</p>
                </div>
              ) : stats ? (
                <>
                  {/* Metric Cards Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { title: 'Thành viên', val: stats.totalUsers, icon: 'group', desc: 'Tài khoản đã đăng ký' },
                      { title: 'Trang kỷ niệm', val: stats.totalPages, icon: 'web', desc: `+${stats.pagesToday} hôm nay` },
                      { title: 'Lượt xem trang', val: stats.totalViews, icon: 'visibility', desc: 'Toán hệ thống' },
                      { title: 'Dung lượng ổ đĩa', val: stats.storageUsage, icon: 'database', desc: 'Đã tải lên uploads/' }
                    ].map((item, idx) => (
                      <div key={idx} className="glass-panel p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold text-on-surface-variant">{item.title}</span>
                          <span className="material-symbols-outlined text-primary text-lg">{item.icon}</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-on-surface">{item.val}</h2>
                          <p className="text-[10px] text-on-surface-variant/80 mt-1">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Themes / Categories usage stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-panel p-6 rounded-3xl space-y-4">
                      <h3 className="font-h3 text-h3 text-on-surface font-bold">Thống kê Theme được sử dụng nhiều nhất</h3>
                      <div className="space-y-3 pt-2">
                        {stats.themeStats.map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-medium text-on-surface-variant">
                              <span className="capitalize">{item._id || 'Không xác định'}</span>
                              <span>{item.count} trang</span>
                            </div>
                            <div className="w-full h-2 bg-secondary-fixed/50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${(item.count / (stats.totalPages || 1)) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
                      <div>
                        <h3 className="font-h3 text-h3 text-on-surface font-bold">Thành phần Hệ thống</h3>
                        <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                          Hiện tại Luvia đang cung cấp <b>{stats.totalThemes} theme giao diện động</b> nằm trong <b>{stats.totalCategories} nhóm phong cách khác nhau</b>. 
                          Tất cả các tệp hình ảnh xem trước và nhạc nền được quản lý lưu trữ tập trung.
                        </p>
                      </div>
                      <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-2xl border border-primary/10 mt-4">
                        <span className="material-symbols-outlined text-primary">info</span>
                        <span className="text-[11px] text-on-surface-variant leading-tight">
                          Admin có thể điều chỉnh cấu hình theme để thêm hiệu ứng rải tuyết/tim bay tự động cho người dùng.
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-on-surface-variant">Lỗi kết xuất dữ liệu thống kê.</div>
              )}
            </div>
          )}

          {/* TAB 2: THEME MANAGEMENT */}
          {activeTab === 'themes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Danh sách themes</span>
                <button
                  type="button"
                  onClick={() => openThemeModal()}
                  className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Thêm Theme mới
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {themes.map((t) => (
                  <div key={t._id} className="glass-panel rounded-3xl overflow-hidden flex flex-col justify-between shadow-sm border border-secondary-container/10 bg-white/40">
                    <div className="aspect-[4/3] bg-surface-container flex items-center justify-center relative border-b overflow-hidden">
                      {t.thumbnail ? (
                        <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-4xl text-primary-container">palette</span>
                      )}
                      <span className={`absolute top-3 right-3 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'published' ? 'bg-green-100 text-green-800' : t.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className="font-body-lg font-bold text-on-surface flex items-center justify-between">
                          <span>{t.name}</span>
                          <span className="text-xs font-mono font-normal text-on-surface-variant">({t.key})</span>
                        </h3>
                        <p className="text-xs text-on-surface-variant mt-1.5 line-clamp-2">{t.description}</p>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-on-surface-variant border-t border-secondary-container/10 pt-3">
                        <span className="font-semibold uppercase tracking-wider text-primary">
                          {(t.category && typeof t.category === 'object') ? t.category.name : 'Chưa phân loại'}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openThemeModal(t)}
                            className="p-1.5 hover:bg-primary/10 rounded-lg text-on-surface-variant hover:text-primary transition-all"
                            title="Sửa theme"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteEntity('theme', t._id)}
                            className="p-1.5 hover:bg-error-container/20 rounded-lg text-on-surface-variant hover:text-error transition-all"
                            title="Xóa theme"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Danh mục theme</span>
                <button
                  type="button"
                  onClick={() => openCategoryModal()}
                  className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Thêm danh mục
                </button>
              </div>

              <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface-container-high/40 text-on-surface-variant font-label-caps border-b border-secondary-container/10">
                      <th className="p-4 font-bold uppercase">Biểu tượng</th>
                      <th className="p-4 font-bold uppercase">Tên danh mục</th>
                      <th className="p-4 font-bold uppercase">Mã (Slug)</th>
                      <th className="p-4 font-bold uppercase">Thứ tự</th>
                      <th className="p-4 font-bold uppercase">Trạng thái</th>
                      <th className="p-4 font-bold uppercase text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-container/10 font-body-md text-xs">
                    {categories.map((cat) => (
                      <tr key={cat._id} className="hover:bg-primary/5 transition-all">
                        <td className="p-4 text-sm font-semibold">{cat.icon || '📁'}</td>
                        <td className="p-4 font-semibold text-on-surface">{cat.name}</td>
                        <td className="p-4 text-on-surface-variant font-mono">{cat.slug}</td>
                        <td className="p-4 text-on-surface-variant">{cat.displayOrder || 0}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            cat.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {cat.status}
                          </span>
                        </td>
                        <td className="p-4 text-right flex justify-end gap-1">
                          <button onClick={() => openCategoryModal(cat)} className="p-1.5 hover:bg-primary/10 rounded-lg text-on-surface-variant hover:text-primary transition-all">
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button onClick={() => handleDeleteEntity('category', cat._id)} className="p-1.5 hover:bg-error-container/20 rounded-lg text-on-surface-variant hover:text-error transition-all">
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: OCCASIONS */}
          {activeTab === 'occasions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Danh sách dịp đặc biệt</span>
                <button
                  type="button"
                  onClick={() => openOccasionModal()}
                  className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Thêm Dịp mới
                </button>
              </div>

              <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface-container-high/40 text-on-surface-variant font-label-caps border-b border-secondary-container/10">
                      <th className="p-4 font-bold uppercase">Icon</th>
                      <th className="p-4 font-bold uppercase">Dịp</th>
                      <th className="p-4 font-bold uppercase">Mã (Slug)</th>
                      <th className="p-4 font-bold uppercase">Mô tả</th>
                      <th className="p-4 font-bold uppercase">Thứ tự</th>
                      <th className="p-4 font-bold uppercase">Trạng thái</th>
                      <th className="p-4 font-bold uppercase text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-container/10 font-body-md text-xs">
                    {occasions.map((occ) => (
                      <tr key={occ._id} className="hover:bg-primary/5 transition-all">
                        <td className="p-4 text-sm font-semibold">{occ.icon || '✨'}</td>
                        <td className="p-4 font-semibold text-on-surface">{occ.name}</td>
                        <td className="p-4 text-on-surface-variant font-mono">{occ.slug}</td>
                        <td className="p-4 text-on-surface-variant max-w-[200px] truncate">{occ.description || 'Không có mô tả'}</td>
                        <td className="p-4 text-on-surface-variant">{occ.displayOrder || 0}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            occ.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {occ.status}
                          </span>
                        </td>
                        <td className="p-4 text-right flex justify-end gap-1">
                          <button onClick={() => openOccasionModal(occ)} className="p-1.5 hover:bg-primary/10 rounded-lg text-on-surface-variant hover:text-primary transition-all">
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button onClick={() => handleDeleteEntity('occasion', occ._id)} className="p-1.5 hover:bg-error-container/20 rounded-lg text-on-surface-variant hover:text-error transition-all">
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM MUSIC */}
          {activeTab === 'music' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Kho nhạc nền hệ thống</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFreeMusicModal(true)}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-md transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <span className="material-symbols-outlined text-sm">search</span>
                    Tìm nhạc miễn phí
                  </button>
                  <button
                    type="button"
                    onClick={() => openMusicModal()}
                    className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Upload Nhạc mới
                  </button>
                </div>
              </div>

              <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface-container-high/40 text-on-surface-variant font-label-caps border-b border-secondary-container/10">
                      <th className="p-4 font-bold uppercase">Tên bài hát</th>
                      <th className="p-4 font-bold uppercase">Nghệ sĩ</th>
                      <th className="p-4 font-bold uppercase">Đường dẫn tệp</th>
                      <th className="p-4 font-bold uppercase">Phân loại</th>
                      <th className="p-4 font-bold uppercase">Trạng thái</th>
                      <th className="p-4 font-bold uppercase text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-container/10 font-body-md text-xs">
                    {musics.map((m) => (
                      <tr key={m._id} className="hover:bg-primary/5 transition-all">
                        <td className="p-4 font-semibold text-on-surface flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-sm">music_note</span>
                          <span>{m.name}</span>
                        </td>
                        <td className="p-4 text-on-surface-variant">{m.artist}</td>
                        <td className="p-4 text-on-surface-variant font-mono max-w-[180px] truncate" title={m.file}>
                          {m.file}
                        </td>
                        <td className="p-4 text-on-surface-variant capitalize">{m.category}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            m.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="p-4 text-right flex justify-end gap-1">
                          <button onClick={() => openMusicModal(m)} className="p-1.5 hover:bg-primary/10 rounded-lg text-on-surface-variant hover:text-primary transition-all">
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button onClick={() => handleDeleteEntity('music', m._id)} className="p-1.5 hover:bg-error-container/20 rounded-lg text-on-surface-variant hover:text-error transition-all">
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: PAGES MODERATION */}
          {activeTab === 'pages' && (
            <div className="space-y-6">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Quản lý các trang kỷ niệm đã tạo</span>
              <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface-container-high/40 text-on-surface-variant font-label-caps border-b border-secondary-container/10">
                      <th className="p-4 font-bold uppercase">Tiêu đề</th>
                      <th className="p-4 font-bold uppercase">Mã (Slug)</th>
                      <th className="p-4 font-bold uppercase">Chủ sở hữu</th>
                      <th className="p-4 font-bold uppercase">Lượt xem</th>
                      <th className="p-4 font-bold uppercase">Ngày tạo</th>
                      <th className="p-4 font-bold uppercase">Trạng thái</th>
                      <th className="p-4 font-bold uppercase text-right">Điều hành</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-container/10 font-body-md text-xs">
                    {pages.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-10 text-center text-on-surface-variant">Không có trang kỷ niệm nào được tạo.</td>
                      </tr>
                    ) : (
                      pages.map((p) => (
                        <tr key={p._id} className="hover:bg-primary/5 transition-all">
                          <td className="p-4 font-semibold text-on-surface truncate max-w-[150px]">{p.title}</td>
                          <td className="p-4 font-mono text-primary font-semibold">{p.slug}</td>
                          <td className="p-4 text-on-surface-variant">
                            {typeof p.userId === 'object' && p.userId !== null
                              ? `${(p.userId as any).fullname} (@${(p.userId as any).username})`
                              : p.userId || 'Chưa nhận dạng'}
                          </td>
                          <td className="p-4 text-on-surface-variant">{p.views || 0}</td>
                          <td className="p-4 text-on-surface-variant">{new Date(p.createdAt).toLocaleDateString('vi-VN')}</td>
                          <td className="p-4">
                            <select
                              value={p.status || 'PUBLISHED'}
                              onChange={(e) => handleUpdatePageStatus(p._id, e.target.value)}
                              className="px-2 py-1 rounded-lg border bg-white outline-none cursor-pointer"
                            >
                              <option value="DRAFT">DRAFT</option>
                              <option value="PUBLISHED">PUBLISHED</option>
                              <option value="HIDDEN">HIDDEN (Ẩn)</option>
                              <option value="ARCHIVED">ARCHIVED</option>
                            </select>
                          </td>
                          <td className="p-4 text-right flex justify-end gap-1">
                            <button
                              onClick={() => window.open(`/page/${p.slug}`, '_blank')}
                              className="p-1.5 hover:bg-primary/10 rounded-lg text-on-surface-variant hover:text-primary transition-all"
                              title="Xem trang"
                            >
                              <span className="material-symbols-outlined text-base">visibility</span>
                            </button>
                            <button
                              onClick={() => handleDeletePage(p._id, p.slug)}
                              className="p-1.5 hover:bg-error-container/20 rounded-lg text-on-surface-variant hover:text-error transition-all"
                              title="Xóa vĩnh viễn"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: USERS */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Quản lý người dùng</span>
              <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface-container-high/40 text-on-surface-variant font-label-caps border-b border-secondary-container/10">
                      <th className="p-4 font-bold uppercase">Họ và tên</th>
                      <th className="p-4 font-bold uppercase">Tên tài khoản</th>
                      <th className="p-4 font-bold uppercase">Email</th>
                      <th className="p-4 font-bold uppercase">Quyền hạn</th>
                      <th className="p-4 font-bold uppercase text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-container/10 font-body-md text-xs">
                    {users.map((userNode) => (
                      <tr key={userNode.id} className="hover:bg-primary/5 transition-all">
                        <td className="p-4 font-semibold text-on-surface">{userNode.fullname}</td>
                        <td className="p-4 text-on-surface-variant">@{userNode.username}</td>
                        <td className="p-4 text-on-surface-variant">{userNode.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            userNode.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {userNode.role}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {userNode.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(userNode.id, userNode.fullname)}
                              className="p-1.5 hover:bg-error-container/20 text-on-surface-variant hover:text-error rounded-lg transition-all"
                              title="Xóa tài khoản"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* POPUP MODAL FOR CRUD */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-2xl bg-surface rounded-[2rem] p-8 md:p-10 shadow-2xl overflow-y-auto max-h-[85vh] custom-scrollbar space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="font-h2 text-h2 text-on-surface font-bold">
                {editingId ? 'Cập nhật' : 'Thêm mới'}{' '}
                {modalType === 'theme' ? 'Theme Giao diện' : modalType === 'category' ? 'Danh mục' : modalType === 'occasion' ? 'Dịp sự kiện' : 'Nhạc nền'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:bg-secondary-container/10 p-2 rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* FORM 1: CATEGORY FORM */}
            {modalType === 'category' && (
              <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs font-medium text-on-surface-variant">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Tên danh mục</label>
                    <input type="text" value={categoryName} onChange={e => setCategoryName(e.target.value)} required className="w-full px-4 py-2.5 border rounded-xl" placeholder="e.g. Tình yêu" />
                  </div>
                  <div>
                    <label className="block mb-1">Mã (Slug)</label>
                    <input type="text" value={categorySlug} onChange={e => setCategorySlug(e.target.value)} required className="w-full px-4 py-2.5 border rounded-xl" placeholder="e.g. love" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1">Icon đại diện</label>
                    <input type="text" value={categoryIcon} onChange={e => setCategoryIcon(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl" placeholder="e.g. favorite" />
                  </div>
                  <div>
                    <label className="block mb-1">Thứ tự hiển thị</label>
                    <input type="number" value={categoryOrder} onChange={e => setCategoryOrder(Number(e.target.value))} className="w-full px-4 py-2.5 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block mb-1">Trạng thái</label>
                    <select value={categoryStatus} onChange={e => setCategoryStatus(e.target.value as any)} className="w-full px-4 py-2.5 border rounded-xl bg-white">
                      <option value="active">Active (Hoạt động)</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl shadow-md">Lưu thông tin</button>
              </form>
            )}

            {/* FORM 2: OCCASION FORM */}
            {modalType === 'occasion' && (
              <form onSubmit={handleOccasionSubmit} className="space-y-4 text-xs font-medium text-on-surface-variant">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Tên Dịp kỷ niệm</label>
                    <input type="text" value={occasionName} onChange={e => setOccasionName(e.target.value)} required className="w-full px-4 py-2.5 border rounded-xl" placeholder="e.g. Sinh nhật" />
                  </div>
                  <div>
                    <label className="block mb-1">Mã (Slug)</label>
                    <input type="text" value={occasionSlug} onChange={e => setOccasionSlug(e.target.value)} required className="w-full px-4 py-2.5 border rounded-xl" placeholder="e.g. birthday" />
                  </div>
                </div>
                <div>
                  <label className="block mb-1">Mô tả ngắn</label>
                  <input type="text" value={occasionDesc} onChange={e => setOccasionDesc(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl" placeholder="e.g. Dành cho các dịp sinh nhật..." />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1">Icon đại diện</label>
                    <input type="text" value={occasionIcon} onChange={e => setOccasionIcon(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl" placeholder="e.g. cake" />
                  </div>
                  <div>
                    <label className="block mb-1">Thứ tự hiển thị</label>
                    <input type="number" value={occasionOrder} onChange={e => setOccasionOrder(Number(e.target.value))} className="w-full px-4 py-2.5 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block mb-1">Trạng thái</label>
                    <select value={occasionStatus} onChange={e => setOccasionStatus(e.target.value as any)} className="w-full px-4 py-2.5 border rounded-xl bg-white">
                      <option value="active">Active (Hoạt động)</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl shadow-md">Lưu thông tin</button>
              </form>
            )}

            {/* FORM 3: THEME FORM */}
            {modalType === 'theme' && (
              <form onSubmit={handleThemeSubmit} className="space-y-4 text-xs font-medium text-on-surface-variant">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Tên Theme</label>
                    <input type="text" value={themeName} onChange={e => setThemeName(e.target.value)} required className="w-full px-4 py-2.5 border rounded-xl" placeholder="e.g. Ấm áp gia đình" />
                  </div>
                  <div>
                    <label className="block mb-1">Khóa (Key - unique)</label>
                    <input type="text" value={themeKey} onChange={e => setThemeKey(e.target.value)} required className="w-full px-4 py-2.5 border rounded-xl" placeholder="e.g. warm-family" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Mô tả chủ đề</label>
                    <input type="text" value={themeDesc} onChange={e => setThemeDesc(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block mb-1">Nhóm danh mục</label>
                    <select value={themeCategory} onChange={e => setThemeCategory(e.target.value)} required className="w-full px-4 py-2.5 border rounded-xl bg-white">
                      <option value="">Chọn danh mục...</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Filters checkbox list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-bold">1. Đối tượng được hỗ trợ (supportedRecipients)</label>
                    <div className="grid grid-cols-2 gap-2 border p-3 rounded-2xl max-h-[140px] overflow-y-auto custom-scrollbar">
                      {allRecipients.map((rec) => (
                        <label key={rec} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={themeRecipients.includes(rec)} onChange={() => toggleRecipientType(rec)} />
                          <span>{rec}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 font-bold">2. Dịp kỷ niệm được hỗ trợ (supportedOccasions)</label>
                    <div className="grid grid-cols-2 gap-2 border p-3 rounded-2xl max-h-[140px] overflow-y-auto custom-scrollbar">
                      {occasions.map((occ) => (
                        <label key={occ._id} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={themeOccasions.includes(occ._id)} onChange={() => toggleOccasion(occ._id)} />
                          <span>{occ.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Colors, Fonts, Background, Anim */}
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block mb-1">Màu chính</label>
                    <div className="flex gap-1">
                      <input type="color" value={themePrimary} onChange={e => setThemePrimary(e.target.value)} className="w-8 h-8 rounded border outline-none" />
                      <input type="text" value={themePrimary} onChange={e => setThemePrimary(e.target.value)} className="w-full px-2 border rounded-lg text-[10px]" />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1">Màu phụ</label>
                    <div className="flex gap-1">
                      <input type="color" value={themeSecondary} onChange={e => setThemeSecondary(e.target.value)} className="w-8 h-8 rounded border outline-none" />
                      <input type="text" value={themeSecondary} onChange={e => setThemeSecondary(e.target.value)} className="w-full px-2 border rounded-lg text-[10px]" />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1">Font chữ</label>
                    <select value={themeFont} onChange={e => setThemeFont(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white">
                      {allFonts.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">Hiệu ứng động</label>
                    <select value={themeAnim} onChange={e => setThemeAnim(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white">
                      {allAnimations.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <label className="block mb-1">Màu/Nền (CSS background)</label>
                    <input type="text" value={themeBg} onChange={e => setThemeBg(e.target.value)} className="w-full px-4 py-2 border rounded-xl" placeholder="e.g. #ffeef8..." />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {BACKGROUND_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setThemeBg(preset.background);
                            setThemePrimary(preset.primaryColor);
                            setThemeSecondary(preset.secondaryColor);
                          }}
                          className="w-6 h-6 rounded-full border border-black/10 shadow-sm hover:scale-110 transition-all cursor-pointer"
                          style={{ background: preset.background }}
                          title={preset.name}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1">Layout chung</label>
                    <select value={themeLayout} onChange={e => setThemeLayout(e.target.value)} className="w-full px-4 py-2 border rounded-xl bg-white">
                      {allLayouts.map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">Kiểu hiển thị Gallery</label>
                    <select value={themeGalleryLayout} onChange={e => setThemeGalleryLayout(e.target.value)} className="w-full px-4 py-2 border rounded-xl bg-white">
                      <option value="cosmic">🚀 Vũ trụ 3D</option>
                      <option value="polaroid">🖼️ Polaroid ấm áp</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">Kiểu hiển thị Phong thư</label>
                    <select value={themeLetterLayout} onChange={e => setThemeLetterLayout(e.target.value)} className="w-full px-4 py-2 border rounded-xl bg-white">
                      <option value="flowers">💐 Vườn hoa hồng</option>
                      <option value="cozy">✉️ Phong thư ấm cúng</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">Trạng thái theme</label>
                    <select value={themeStatus} onChange={e => setThemeStatus(e.target.value as any)} className="w-full px-4 py-2 border rounded-xl bg-white">
                      <option value="draft">Draft (Bản nháp)</option>
                      <option value="published">Published (Công khai)</option>
                      <option value="disabled">Disabled (Vô hiệu hóa)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Ảnh đại diện theme (Thumbnail)</label>
                    <input type="file" onChange={e => setThemeThumbFile(e.target.files?.[0] || null)} accept="image/*" className="w-full text-xs" />
                  </div>
                  <div>
                    <label className="block mb-1">Ảnh xem trước theme (Preview)</label>
                    <input type="file" onChange={e => setThemePrevFile(e.target.files?.[0] || null)} accept="image/*" className="w-full text-xs" />
                  </div>
                </div>

                <div>
                  <label className="block mb-1">Nhạc nền mặc định (Đường dẫn nhạc URL)</label>
                  <input type="text" value={themeMusic} onChange={e => setThemeMusic(e.target.value)} className="w-full px-4 py-2 border rounded-xl" placeholder="e.g. http://..." />
                </div>

                <button type="submit" className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl shadow-md">Lưu chủ đề giao diện</button>
              </form>
            )}

            {/* FORM 4: MUSIC FORM */}
            {modalType === 'music' && (
              <form onSubmit={handleMusicSubmit} className="space-y-4 text-xs font-medium text-on-surface-variant">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Tên bài hát</label>
                    <input type="text" value={musicName} onChange={e => setMusicName(e.target.value)} required className="w-full px-4 py-2.5 border rounded-xl" placeholder="e.g. My Love" />
                  </div>
                  <div>
                    <label className="block mb-1">Nghệ sĩ trình bày</label>
                    <input type="text" value={musicArtist} onChange={e => setMusicArtist(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl" placeholder="e.g. Westlife" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1">Thời lượng (giây)</label>
                    <input type="number" value={musicDuration} onChange={e => setMusicDuration(Number(e.target.value))} className="w-full px-4 py-2.5 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block mb-1">Phân loại thể loại</label>
                    <input type="text" value={musicCategory} onChange={e => setMusicCategory(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl" placeholder="e.g. romantic, family..." />
                  </div>
                  <div>
                    <label className="block mb-1">Trạng thái hoạt động</label>
                    <select value={musicStatus} onChange={e => setMusicStatus(e.target.value as any)} className="w-full px-4 py-2.5 border rounded-xl bg-white">
                      <option value="active">Active (Hoạt động)</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="border border-secondary-container/20 p-3.5 rounded-2xl bg-surface-container-low/30 space-y-3">
                    <span className="font-bold text-primary text-[10px] uppercase tracking-wider block">Tệp âm thanh (.mp3, .wav)</span>
                    <div>
                      <label className="block mb-1 text-[10px] text-on-surface-variant">Chọn tệp từ máy tính:</label>
                      <input type="file" onChange={e => setMusicFile(e.target.files?.[0] || null)} accept="audio/mp3,audio/wav" className="w-full text-xs animate-none" />
                    </div>
                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-secondary-container/10"></div>
                      <span className="flex-shrink mx-2 text-[9px] text-on-surface-variant/60 font-semibold uppercase">Hoặc</span>
                      <div className="flex-grow border-t border-secondary-container/10"></div>
                    </div>
                    <div>
                      <label className="block mb-1 text-[10px] text-on-surface-variant">Nhập đường dẫn âm thanh trực tiếp (URL):</label>
                      <input type="text" value={musicFileUrl} onChange={e => setMusicFileUrl(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs outline-none focus:border-primary" placeholder="e.g. https://domain.com/song.mp3" />
                      {invalidAudioUrl && (
                        <div className="mt-2 flex items-start gap-1.5 text-error text-[10px] leading-snug bg-error-container/20 border border-error/20 rounded-lg p-2">
                          <span className="material-symbols-outlined text-sm shrink-0">warning</span>
                          <span>
                            Đường dẫn này không phải tệp âm thanh trực tiếp nên sẽ <b>không phát được nhạc</b>.
                            Hãy nhập URL kết thúc bằng đuôi hợp lệ (mp3, wav, ogg, m4a...) hoặc tải tệp từ máy tính để người dùng có thể nghe thử.
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-secondary-container/10">
                      <AudioPreviewButton src={musicAudioPreviewSrc} size="sm" className="bg-primary text-on-primary" />
                      <span className="text-[10px] text-on-surface-variant">
                        {musicAudioPreviewSrc ? 'Nghe thử bài hát' : 'Lưu tệp/URL để có thể nghe thử'}
                      </span>
                    </div>
                  </div>

                  <div className="border border-secondary-container/20 p-3.5 rounded-2xl bg-surface-container-low/30 space-y-3">
                    <span className="font-bold text-primary text-[10px] uppercase tracking-wider block">Ảnh đại diện (Thumbnail)</span>
                    <div>
                      <label className="block mb-1 text-[10px] text-on-surface-variant">Chọn hình ảnh từ máy tính:</label>
                      <input type="file" onChange={e => setMusicThumbFile(e.target.files?.[0] || null)} accept="image/*" className="w-full text-xs animate-none" />
                    </div>
                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-secondary-container/10"></div>
                      <span className="flex-shrink mx-2 text-[9px] text-on-surface-variant/60 font-semibold uppercase">Hoặc</span>
                      <div className="flex-grow border-t border-secondary-container/10"></div>
                    </div>
                    <div>
                      <label className="block mb-1 text-[10px] text-on-surface-variant">Nhập đường dẫn ảnh đại diện trực tiếp (URL):</label>
                      <input type="text" value={musicThumbnailUrl} onChange={e => setMusicThumbnailUrl(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-xs outline-none focus:border-primary" placeholder="e.g. https://domain.com/image.jpg" />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl shadow-md">Tải lên / Lưu nhạc nền</button>
              </form>
            )}
          </div>
        </div>
      , document.body)}

      {/* FREE MUSIC MODAL */}
      {showFreeMusicModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-surface text-on-surface w-full max-w-2xl rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setShowFreeMusicModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant p-2 rounded-full transition-all duration-300"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl animate-pulse">search</span>
              <div>
                <h3 className="text-xl font-bold">Tìm kiếm & Thêm Nhạc Miễn Phí</h3>
                <p className="text-xs text-on-surface-variant">Tìm kiếm nhạc từ thư viện HearThis.at và lưu vào hệ thống của bạn</p>
              </div>
            </div>

            <form onSubmit={handleSearchFreeMusic} className="flex gap-2 text-xs">
              <input
                type="text"
                value={freeMusicQuery}
                onChange={e => setFreeMusicQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 border rounded-xl outline-none focus:border-primary"
                placeholder="Nhập tên bài hát hoặc thể loại (ví dụ: lofi, chill, acoustic...)"
              />
              <button
                type="submit"
                disabled={freeMusicSearching}
                className="bg-primary text-on-primary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">search</span>
                {freeMusicSearching ? 'Đang tìm...' : 'Tìm kiếm'}
              </button>
            </form>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="font-bold text-sm text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">queue_music</span>
                  {freeMusicQuery.trim() ? 'Kết quả tìm kiếm:' : 'Nhạc phổ biến đề xuất:'}
                </h4>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-on-surface-variant">Lưu vào mục:</span>
                  <select
                    value={freeMusicCategory}
                    onChange={e => setFreeMusicCategory(e.target.value)}
                    className="px-2 py-1 border rounded-lg bg-white outline-none text-xs"
                  >
                    <option value="general">Chung (General)</option>
                    <option value="lofi">Lofi</option>
                    <option value="chill">Chill</option>
                    <option value="romantic">Romantic</option>
                    <option value="acoustic">Acoustic</option>
                    <option value="pop">Pop</option>
                    <option value="cinematic">Cinematic</option>
                  </select>
                </div>
              </div>

              {freeMusicSearching ? (
                <div className="text-center py-8 text-xs text-on-surface-variant flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-2xl text-primary">sync</span>
                  Đang tải nhạc miễn phí...
                </div>
              ) : freeMusicResults.length === 0 ? (
                <div className="text-center py-8 text-xs text-on-surface-variant">
                  Không tìm thấy bài hát nào. Thử từ khóa khác xem sao nhé!
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 max-h-[45vh] overflow-y-auto pr-1 custom-scrollbar">
                  {freeMusicResults.map((track: any) => {
                    const isPlaying = playingClipId === track.id;
                    const durationMin = Math.floor(track.duration / 60);
                    const durationSec = String(Math.floor(track.duration % 60)).padStart(2, '0');

                    return (
                      <div key={track.id} className="flex gap-4 p-3 border rounded-2xl bg-surface-container-low hover:shadow-sm transition-all items-center">
                        {track.thumbnailUrl ? (
                          <img
                            src={track.thumbnailUrl}
                            alt="Cover"
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-lg">music_note</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs text-on-surface truncate" title={track.name}>
                            {track.name}
                          </div>
                          <div className="text-[10px] text-on-surface-variant truncate">
                            {track.artist} • {durationMin}:{durationSec}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handlePlayClip(track)}
                            className="p-2 bg-secondary text-on-secondary rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-sm cursor-pointer"
                            title={isPlaying ? "Dừng thử" : "Nghe thử"}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {isPlaying ? 'pause' : 'play_arrow'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveFreeMusicToLibrary(track)}
                            className="px-3 py-1.5 bg-primary text-on-primary rounded-xl flex items-center gap-1 text-[11px] font-bold hover:scale-105 transition-all shadow-sm cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xs">bookmark_add</span>
                            Lưu kho
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
};

export default AdminDashboard;
