import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';

import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import AdminPage from '../pages/AdminPage';
import LovePageDetailPage from '../pages/LovePageDetailPage';
import LovePageBuilder from '../features/love-page/LovePageBuilder';
import GalleryPage from '../pages/khoanh-khac/GalleryPage';
import LetterPage from '../pages/doc-thu/LetterPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Layout Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
        </Route>

        {/* Auth Layout Routes */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Private Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="create" element={<LovePageBuilder />} />
          <Route path="edit/:id" element={<LovePageBuilder />} />
        </Route>

        {/* Private Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminPage />} />
        </Route>

        {/* Unlocked Love Page View */}
        <Route path="/page/:slug" element={<LovePageDetailPage />} />

        {/* Cosmic Gallery */}
        <Route path="/page/:slug/gallery" element={<GalleryPage />} />

        {/* Letter & Ending Page */}
        <Route path="/page/:slug/letter" element={<LetterPage />} />

        {/* Fallback 404 Route */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
              <div className="space-y-4">
                <span className="material-symbols-outlined text-[72px] text-primary animate-bounce">heart_broken</span>
                <h1 className="font-display text-h1 text-on-surface font-bold">404 — Không Tìm Thấy</h1>
                <p className="font-body-md text-on-surface-variant max-w-md mx-auto">
                  Trang bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.
                </p>
                <div className="pt-4">
                  <a
                    href="/"
                    className="inline-block bg-primary text-on-primary font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-all shadow-md"
                  >
                    Quay lại Trang chủ
                  </a>
                </div>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
