
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Users,
  Layers,
  Facebook,
  Instagram,
  Youtube,
  FileText,
  BookOpen,
  LayoutDashboard
} from 'lucide-react';

import { clsx } from 'clsx';
import { ThemeToggle } from './ThemeToggle';
import { ProfileDropdown } from './ProfileDropdown';
import { useAuthStore } from '@/store/authStore';
import { useSettings } from '@/contexts/SettingsContext';
import { getFileUrl } from '@/utils/fileUrl';

// Custom Icons for TikTok and Telegram
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const TEACHER_IMAGE = '/assets/السير_الشامي/594930133_1456894779774091_6490422839217536606_n.jpg';

const navLinks = [
  { label: 'الرئيسية', href: '/' },
  { label: 'عن السير الشامي', href: '/about', icon: Users },
  { label: 'الكورسات', href: '/courses', icon: Layers },
  { label: 'المذاكرات', href: '/mozakrat', icon: FileText },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const { settings } = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out flex justify-center',
        isScrolled ? 'pt-4' : 'pt-8'
      )}
    >
      <div className="w-full max-w-7xl px-4 sm:px-6">
        <div className={clsx(
          "flex items-center justify-between transition-all duration-700 rounded-[2.5rem] border backdrop-blur-3xl shadow-2xl relative w-full",
          isScrolled
            ? "bg-[var(--bg-secondary)]/90 border-[var(--brand-500)]/30 px-6 py-2 shadow-brand-500/10"
            : "bg-[var(--bg-secondary)]/60 border-white/20 dark:border-white/10 px-10 py-5"
        )}>
          {/* Subtle math glow background */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-brand-500/20 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-brand-accent/10 blur-3xl" />
          </div>

          {/* Logo Section - Enhanced Ring */}
          <Link to="/" className="flex items-center gap-4 group relative z-10">
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-[var(--brand-secondary)] to-[var(--brand-accent)] blur opacity-40 group-hover:opacity-100 transition-all duration-700 animate-pulse" />
              <img
                src={settings?.logo_url ? getFileUrl(settings.logo_url) : TEACHER_IMAGE}
                alt={settings?.app_name || 'Al-Seer Al-Shami'}
                className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-[var(--brand-secondary)]/30 object-cover bg-white p-0.5 group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-[10px] font-black text-[var(--brand-secondary)] uppercase tracking-[.4em] leading-none mb-1 shadow-sm">{settings?.app_name || 'منصه'}</span>
              <span className="text-xl font-black text-[var(--text-primary)] leading-none tracking-tight font-display">{settings?.app_name || 'السير الشامي'}</span>
            </div>
          </Link>

          {/* Desktop Navigation - Glass Pill */}
          <div className="hidden lg:flex items-center gap-3 bg-[var(--brand-500)]/5 dark:bg-black/30 p-1.5 rounded-full border border-[var(--brand-500)]/10 dark:border-white/5 backdrop-blur-xl relative z-10 px-4">
            {[
              ...navLinks,
              ...(isAuthenticated ? [
                {
                  label: user?.role === 'admin' ? 'لوحة الإدارة' : user?.role === 'assistant' ? 'لوحة التحكم' : 'لوحة الطالب',
                  href: user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'assistant' ? '/assistant/dashboard' : '/dashboard',
                  icon: LayoutDashboard
                }
              ] : [])
            ].map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={clsx(
                    'px-4 py-2 rounded-full text-[13px] font-black transition-all duration-500 relative group whitespace-nowrap',
                    isActive ? 'text-[var(--brand-500)] dark:text-white' : 'text-[var(--text-secondary)] dark:text-white/70 hover:text-[var(--brand-500)] dark:hover:text-white'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-[var(--brand-50)] dark:bg-gradient-to-r dark:from-[var(--brand-600)] dark:to-[var(--brand-500)] rounded-full z-0 border border-[var(--brand-500)]/20 dark:border-white/10 shadow-sm dark:shadow-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="flex items-center gap-2 relative z-10">
                    <span className="tracking-wide">{link.label}</span>
                    <span className="absolute -top-1 -right-2 text-[8px] text-[var(--brand-secondary)] opacity-0 group-hover:opacity-100 transition-all font-serif pointer-events-none">x²</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Action Buttons - Premium Refinement */}
          <div className="flex items-center gap-2 sm:gap-4 relative z-10">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="bg-[var(--brand-500)]/5 dark:bg-white/5 backdrop-blur-md p-1 rounded-full border border-[var(--brand-500)]/10 dark:border-white/10">
                <ProfileDropdown />
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-6 py-2.5 rounded-full text-xs font-black text-[var(--text-secondary)] dark:text-white/90 hover:text-[var(--brand-500)] dark:hover:text-white hover:bg-[var(--brand-500)]/5 dark:hover:bg-white/10 transition-all uppercase tracking-widest border border-[var(--brand-500)]/10 dark:border-white/5"
                >
                  دخول
                </Link>
                <Link
                  to="/register"
                  className="px-7 py-2.5 rounded-full bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-accent)] text-[var(--brand-950)] text-xs font-black shadow-lg shadow-[var(--brand-secondary)]/20 hover:shadow-[var(--brand-secondary)]/40 hover:-translate-y-0.5 transition-all uppercase tracking-widest"
                >
                  اشترك الآن
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-11 h-11 rounded-2xl bg-[var(--brand-500)]/5 dark:bg-white/5 border border-[var(--brand-500)]/10 dark:border-white/10 flex items-center justify-center text-[var(--text-primary)] dark:text-white transition-all active:scale-95 hover:bg-brand-500 hover:text-white"
              aria-label="فتح القائمة"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 dark:bg-black/60 backdrop-blur-2xl z-[60]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: '100%', scale: 1.1 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: '100%', scale: 1.1 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-4 right-4 bottom-4 left-4 sm:left-auto sm:w-[400px] z-[70] bg-[var(--bg-card)] rounded-[3rem] border border-[var(--border-color)] shadow-3xl p-8 flex flex-col"
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <img src={settings?.logo_url || TEACHER_IMAGE} alt={settings?.app_name} className="w-12 h-12 object-contain rounded-xl" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-brand-500 uppercase tracking-widest leading-none mb-1">Navigation</span>
                    <span className="text-xl font-black text-[var(--text-primary)] font-display">{settings?.app_name || 'السير الشامي'}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-12 h-12 rounded-full border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                  aria-label="غلق القائمة"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 flex-grow overflow-y-auto px-2 relative z-10">
                {/* Math background symbols in mobile menu */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.05] flex items-center justify-center -z-10 overflow-hidden">
                  <div className="text-[20rem] font-serif select-none">∑</div>
                </div>

                {[
                  ...navLinks,
                  ...(isAuthenticated ? [
                    {
                      label: user?.role === 'admin' ? 'لوحة الإدارة' : user?.role === 'assistant' ? 'لوحة التحكم' : 'لوحة الطالب',
                      href: user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'assistant' ? '/assistant/dashboard' : '/dashboard',
                      icon: LayoutDashboard
                    }
                  ] : [])
                ].map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-[var(--brand-500)]/5 dark:bg-white/5 border border-[var(--brand-500)]/10 dark:border-white/10 text-[var(--text-primary)] dark:text-white transition-all group relative overflow-hidden active:scale-95"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[var(--brand-600)] to-[var(--brand-500)] text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                      {link.icon ? <link.icon className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-black tracking-tight">{link.label}</span>
                      <span className="text-[10px] text-[var(--brand-secondary)] uppercase font-black tracking-widest opacity-60">Math Academy</span>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <span className="text-4xl italic font-serif opacity-30">π</span>
                    </div>
                  </Link>
                ))}

                {isAuthenticated && (
                  <Link
                    to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'assistant' ? '/assistant/dashboard' : '/dashboard'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-5 p-5 rounded-[2rem] bg-brand-500/5 border border-brand-500/20 text-brand-500 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-black tracking-tight">{user?.role === 'admin' ? 'لوحة الإدارة' : 'لوحة التحكم'}</span>
                  </Link>
                )}
              </div>

              {/* Login/Register for Mobile */}
              {!isAuthenticated && (
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-4 text-center rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] font-black text-[var(--text-primary)] text-xs tracking-widest uppercase hover:bg-[var(--bg-secondary)] transition-all"
                  >
                    دخول
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-4 text-center rounded-2xl bg-brand-500 font-black text-white shadow-xl shadow-brand-500/25 text-xs tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    ابدأ الآن
                  </Link>
                </div>
              )}

              {/* Social Links at Bottom of Mobile Menu */}
              <div className="mt-auto pt-8 border-t border-[var(--border-color)]">
                <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] mb-4 opacity-60">تواصل معنا</p>
                <div className="flex flex-wrap gap-3">
                  {settings?.facebook_url && settings.facebook_url !== '#' && (
                    <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all duration-500">
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {settings?.instagram_url && settings.instagram_url !== '#' && (
                    <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all duration-500">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {settings?.youtube_url && settings.youtube_url !== '#' && (
                    <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-500">
                      <Youtube className="w-4 h-4" />
                    </a>
                  )}
                  {settings?.tiktok_url && settings.tiktok_url !== '#' && (
                    <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-500 flex items-center justify-center hover:bg-slate-800 hover:text-white transition-all duration-500">
                      <TikTokIcon className="w-4 h-4" />
                    </a>
                  )}
                  {settings?.telegram_url && settings.telegram_url !== '#' && (
                    <a href={settings.telegram_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all duration-500">
                      <TelegramIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Groups in Mobile Menu */}
                <div className="mt-5 space-y-2">
                  {settings?.whatsapp_group && settings.whatsapp_group !== '#' && (
                    <a href={settings.whatsapp_group} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10 text-green-600 font-bold text-xs hover:bg-green-500/10 transition-all">
                      <div className="w-7 h-7 rounded-lg bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/20">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <span>جروب الواتساب المشترك</span>
                    </a>
                  )}
                  {settings?.telegram_group && settings.telegram_group !== '#' && (
                    <a href={settings.telegram_group} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-sky-500/5 border border-sky-500/10 text-sky-600 font-bold text-xs hover:bg-sky-500/10 transition-all">
                      <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/20">
                        <TelegramIcon className="w-3.5 h-3.5" />
                      </div>
                      <span>قناة التيليجرام الرسمية</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
