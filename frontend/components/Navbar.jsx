'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlignRight, X, LogOut, User, FileText, Home, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, isDepartment, logout } = useAuth();
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="sticky top-0 z-40 w-full border-b border-gray-300 bg-blue-900 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className='flex justify-center items-center'>
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={50}
              height={50}
            />
            <div className="flex flex-col">
              <Link
                href="/"
                className="text-2xl font-bold tracking-wide"
              >
                GrievEase
              </Link>
              <span className="text-xs font-light text-yellow-100">Government of India | Public Grievance Portal</span>
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:gap-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
              >
                <Button
                  variant="ghost"
                  className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${pathname === item.href ? 'bg-blue-700' : 'hover:bg-blue-800 hover:text-white'
                    }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Button>
              </Link>
            ))}

            {!isAuthenticated && (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="rounded-md hover:bg-blue-800"
                  >
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="rounded-md bg-white text-blue-900 hover:bg-gray-100">
                    {t('nav.signup')}
                  </Button>
                </Link>
              </>
            )}

            {isAuthenticated && (
              <Button
                variant="outline"
                className="flex items-center gap-2 rounded-md border-white text-blue-800 hover:bg-blue-800 hover:text-white"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                <span>{t('nav.logout')}</span>
              </Button>
            )}

            <LanguageSelector />
          </div>

          <div className="flex md:hidden">
            <LanguageSelector />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="ml-2 text-white hover:bg-blue-800"
            >
              <AlignRight className="h-5 w-5" />
            </Button>
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
            className="md:hidden bg-blue-900 shadow-inner text-white"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2 border-t border-gray-300">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                >
                  <Button
                    variant="ghost"
                    className={`w-full justify-start flex items-center gap-2 rounded-md px-3 py-2 ${pathname === item.href ? 'bg-blue-700' : ''
                      }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Button>
                </Link>
              ))}

              {!isAuthenticated && (
                <div className="flex flex-col gap-2 mt-2 border-t border-gray-400 pt-2">
                  <Link href="/login" onClick={closeMenu}>
                    <Button
                      variant="ghost"
                      className="w-full rounded-md hover:bg-blue-800"
                    >
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={closeMenu}>
                    <Button
                      className="w-full rounded-md bg-white text-blue-900 hover:bg-gray-100"
                    >
                      {t('nav.signup')}
                    </Button>
                  </Link>
                </div>
              )}

              {isAuthenticated && (
                <div className="mt-2 border-t border-gray-400 pt-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start flex items-center gap-2 rounded-md border-white hover:bg-blue-800 text-blue-800 hover:text-white"
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('nav.logout')}</span>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
