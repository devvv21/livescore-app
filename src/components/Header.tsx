// src/components/Header.tsx

'use client';

import { useState, useRef, ReactNode, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Star, HelpCircle, Settings, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from './NotificationBell'; // <-- 1. IMPORT THE NEW COMPONENT

interface HeaderProps {
  onSearchToggle: () => void;
  children: ReactNode;
}

const Logo = () => (
  <Link href="/" className="flex items-center space-x-2" aria-label="TLiveScores Home">
    <Image 
      src="/favicon.ico"
      alt="TLiveScores Logo" 
      width={28} 
      height={28} 
    />
    <span className="text-xl font-bold text-white">TLiveScores</span>
  </Link>
);

const Header = ({ onSearchToggle, children }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header ref={headerRef} className="bg-[#1d222d] border-b border-gray-700 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Logo />
          </div>

          <div className="hidden md:block flex-grow max-w-lg mx-8">
            {children}
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-4">
              {/* --- 2. ADD THE NOTIFICATION BELL FOR DESKTOP --- */}
              <NotificationBell />
              {/* --- MODIFIED: Star icon wrapped in a Link --- */}
              <Link href="https://todaylivescores.com/">
                <Star className="text-gray-300 w-6 h-6 hover:text-white cursor-pointer" />
              </Link>
            </div>
            {/* --- MODIFIED: "SIGN IN" button changed to a Link --- */}
            <Link 
              href="https://todaylivescores.com/"
              className="hidden md:block bg-white text-gray-900 font-semibold px-4 py-2 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              SIGN IN
            </Link>
            <div className="md:hidden flex items-center gap-2">
                <button onClick={onSearchToggle} className="p-2 text-gray-300 hover:text-white">
                    <Search size={24} />
                </button>
                {/* We can add the bell to the mobile menu as well */}
                <NotificationBell />
                <button onClick={toggleMenu} className="p-2 text-gray-300 hover:text-white">
                    {isMenuOpen ? <X size={24}/> : <Menu size={24} />}
                </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-16 left-0 w-full bg-[#2b3341] shadow-lg z-30"
          >
            {/* You could add the dropdown items to the mobile menu here if you prefer */}
            <div className="flex flex-col p-4 space-y-4">
              {/* --- MODIFIED: Mobile "Favorites" button changed to a Link --- */}
              <Link 
                href="https://todaylivescores.com/"
                className="flex items-center gap-3 text-gray-200 hover:bg-gray-700 p-2 rounded-md"
              >
                  <Star className="w-5 h-5" />
                  <span>Favorites</span>
              </Link>
              {/* Other mobile menu items */}
              {/* --- MODIFIED: Mobile "SIGN IN" button changed to a Link --- */}
              <Link 
                href="https://todaylivescores.com/"
                className="w-full block text-center bg-white text-gray-900 font-semibold py-2 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                SIGN IN
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;