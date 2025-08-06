'use client';

import { useState, ReactNode } from 'react';

interface TabbedTablesProps {
  injuryTable: ReactNode;
  transferTable: ReactNode;
}

export default function TabbedTables({ injuryTable, transferTable }: TabbedTablesProps) {
  const [activeTab, setActiveTab] = useState<'injuries' | 'transfers'>('injuries');

  // Updated styles to exactly match the screenshot's design
  const baseTabStyle = "flex-1 text-center py-3 px-4 font-bold text-lg text-white focus:outline-none transition-colors duration-200";
  const activeTabStyle = "bg-blue-700"; // A solid, darker blue for the active tab
  const inactiveTabStyle = "bg-[#2D3748] hover:bg-gray-600"; // A dark background for inactive tabs

  return (
    <div>
      <div className="flex rounded-t-lg overflow-hidden shadow-lg">
        <button
          onClick={() => setActiveTab('injuries')}
          className={`${baseTabStyle} ${activeTab === 'injuries' ? activeTabStyle : inactiveTabStyle}`}
        >
          Injuries & Suspensions
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`${baseTabStyle} ${activeTab === 'transfers' ? activeTabStyle : inactiveTabStyle}`}
        >
          Recent Transfers
        </button>
      </div>

      <div>
        {activeTab === 'injuries' ? injuryTable : transferTable}
      </div>
    </div>
  );
}