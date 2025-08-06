// src/components/TabbedForms.tsx

'use client';

import { useState, ReactNode } from 'react';

interface TabbedFormsProps {
  injuryFormComponent: ReactNode;
  transferFormComponent: ReactNode;
}

export default function TabbedForms({
  injuryFormComponent,
  transferFormComponent,
}: TabbedFormsProps) {
  const [activeTab, setActiveTab] = useState<'injury' | 'transfer'>('injury');

  const baseTabStyle = "w-full text-center py-2.5 px-4 font-semibold text-white focus:outline-none transition-colors duration-200";
  const activeTabStyle = "bg-blue-600";
  const inactiveTabStyle = "bg-gray-600 hover:bg-gray-700";

  return (
    <div className="w-full bg-[#2D3748] p-8 rounded-lg shadow-lg h-fit">
      {/* Tab Buttons */}
      <div className="flex mb-6 rounded-lg overflow-hidden">
        <button
          onClick={() => setActiveTab('injury')}
          className={`${baseTabStyle} ${activeTab === 'injury' ? activeTabStyle : inactiveTabStyle}`}
        >
          Create Injury
        </button>
        <button
          onClick={() => setActiveTab('transfer')}
          className={`${baseTabStyle} ${activeTab === 'transfer' ? activeTabStyle : inactiveTabStyle}`}
        >
          Create Transfer
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'injury' ? injuryFormComponent : transferFormComponent}
      </div>
    </div>
  );
}