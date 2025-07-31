// src/components/SportsNav.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
// --- ADD THE NEW ICONS TO THE IMPORT ---
import { Shield, Trophy, Newspaper, Users, TrendingUp, FileText, Binoculars, Radio } from 'lucide-react';

interface SportsNavProps {
  liveMatchCount: number;
}

const SportsNav = ({ liveMatchCount }: SportsNavProps) => {
  const pathname = usePathname();

  // --- THE NAVITEMS ARRAY WITH UPDATED ICONS ---
  const navItems = [
    { name: 'Football', href: '/', icon: <Shield size={18} />, count: liveMatchCount },
    { name: 'Teams', href: '/teams-list', icon: <Users size={18} /> },
    { name: 'Sport Highlights', href: '/highlights', icon: <Trophy size={18} /> },
    // Changed icon from Trophy to TrendingUp for better representation
    { name: 'Predictions', href: '/predictions', icon: <TrendingUp size={18} /> },
    { name: 'Football Scout', href: '/football-scout', icon: <Binoculars size={18} /> },
    { name: 'News', href: '/news', icon: <Radio size={18} /> },
    // Changed icon from Newspaper to FileText to differentiate from News
    { name: 'Blogs', href: '/blog', icon: <FileText size={18} /> },
  ];

  return (
    <nav className="bg-[#1d222d] border-b border-gray-700 ">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="flex items-center space-x-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-1 py-3 text-sm font-semibold relative transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                  {item.count && item.count > 0 && (
                    <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SportsNav;