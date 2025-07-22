'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AdminSidebar = ({ onSignOut }: { onSignOut: () => void }) => {
  const pathname = usePathname();
  const navItems = [
    { href: '/admin/create-post', label: 'Create New Post' },
    { href: '/admin/banner-update', label: 'Banner Update' },
     { href: '/admin/create-prediction', label: 'Creae Prediction post' },
  ];

  return (
    <aside className="w-64 h-screen bg-[#1d222d] text-gray-300 p-6 flex flex-col flex-shrink-0">
      <div>
        <div className="mb-10">
          <Link href="/admin" className="text-2xl font-bold text-white">Admin Panel</Link>
        </div>
        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mt-auto">
        <button
          onClick={onSignOut}
          className="w-full text-left py-2.5 px-4 rounded-md text-sm font-medium bg-red-600/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;