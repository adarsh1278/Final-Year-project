'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlignRight, X, LogOut, User, FileText, Home, MessageSquare, Shield, Phone, Mail, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, isDepartment, logout, user, department } = useAuth();
  const { t } = useTranslation();

  const menuItems = [
    {
      name: t('nav.home'),
      href: '/',
      icon: <Home className="h-4 w-4" />
    },
    ...(isAuthenticated && !isDepartment ? [
      {
        name: t('nav.profile'),
        href: '/profile',
        icon: <User className="h-4 w-4" />
      },
      {
        name: t('home.registerComplaint'),
        href: '/complaint/register',
        icon: <MessageSquare className="h-4 w-4" />
      },
      {
        name: t('nav.complaints'),
        href: '/complaint/history',
        icon: <FileText className="h-4 w-4" />
      }
    ] : []),
    ...(isDepartment ? [
      {
        name: t('nav.dashboard'),
        href: '/department/dashboard',
        icon: <FileText className="h-4 w-4" />
      }
    ] : [])
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top utility bar */}
      <div className="bg-slate-800 text-gray-300 text-xs">
        <div className="container mx-auto px-4 flex items-center justify-between h-8">
          <div className="hidden sm:flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" /> 1800-XXX-XXXX (Toll Free)
            </span>
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" /> helpdesk@grievease.gov.in
            </span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <span className="hidden sm:inline">Screen Reader Access</span>
            <span className="border-l border-gray-600 h-3"></span>
            <LanguageSelector />
          </div>
        </div>
      </div>

      {/* Main header with logo */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 border-b-4 border-yellow-500">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-[72px]">
            {/* Logo section */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <Image
                    src="/images/logo.png"
                    alt="National Emblem"
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-bold text-white tracking-wide leading-tight group-hover:text-yellow-200 transition-colors">
                  GrievEase
                </span>
                <span className="text-[10px] md:text-xs text-yellow-200/90 tracking-wider leading-tight">
                  Government of India | Public Grievance Portal
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-white/15 text-white shadow-inner'
                          : 'text-blue-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </button>
                  </Link>
                );
              })}

              <div className="h-6 w-px bg-white/20 mx-1"></div>

              {!isAuthenticated && (
                <>
                  <Link href="/login">
                    <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-white/10 hover:text-white transition-all">
                      {t('nav.login')}
                    </button>
                  </Link>
                  <Link href="/signup">
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold bg-yellow-500 text-blue-900 hover:bg-yellow-400 transition-all shadow-sm">
                      {t('nav.signup')}
                    </button>
                  </Link>
                </>
              )}

              {isAuthenticated && (
                <div className="flex items-center gap-2">
                  {user && !isDepartment && (
                    <span className="text-xs text-blue-200 hidden lg:block px-2 py-1 bg-white/5 rounded-md">
                      <User className="h-3 w-3 inline mr-1" />{user.name}
                    </span>
                  )}
                  {isDepartment && department && (
                    <span className="text-xs text-blue-200 hidden lg:block px-2 py-1 bg-white/5 rounded-md">
                      <Shield className="h-3 w-3 inline mr-1" />{department.name} Dept
                    </span>
                  )}
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-white hover:bg-white/10 transition-colors"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <AlignRight className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-blue-900 border-b-4 border-yellow-500 shadow-xl"
          >
            <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={closeMenu}>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      pathname === item.href
                        ? 'bg-white/15 text-white'
                        : 'text-blue-100 hover:bg-white/10'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                    <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                  </button>
                </Link>
              ))}

              <div className="h-px bg-white/10 my-2"></div>

              {!isAuthenticated && (
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={closeMenu}>
                    <button className="w-full py-2.5 rounded-lg text-sm font-medium text-blue-100 hover:bg-white/10 transition-all">
                      {t('nav.login')}
                    </button>
                  </Link>
                  <Link href="/signup" onClick={closeMenu}>
                    <button className="w-full py-2.5 rounded-lg text-sm font-semibold bg-yellow-500 text-blue-900 hover:bg-yellow-400 transition-all">
                      {t('nav.signup')}
                    </button>
                  </Link>
                </div>
              )}

              {isAuthenticated && (
                <button
                  onClick={() => { logout(); closeMenu(); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-red-200 hover:bg-red-500/20 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('nav.logout')}</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
