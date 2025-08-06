// src/components/TabbedView.tsx

'use client';

import { useState, ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabbedViewProps {
  tabs: Tab[];
}

export default function TabbedView({ tabs }: TabbedViewProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const baseTabStyle = "flex-1 text-center py-3 px-4 font-bold text-lg text-white focus:outline-none transition-colors duration-300";
  const activeTabStyle = "bg-blue-600 border-b-4 border-blue-400";
  const inactiveTabStyle = "bg-gray-700 hover:bg-gray-600";

  return (
    <div className="w-full">
      {/* Tab Buttons */}
      <div className="flex mb-6 rounded-t-lg overflow-hidden shadow-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${baseTabStyle} ${activeTab === tab.id ? activeTabStyle : inactiveTabStyle}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {tabs.map((tab) => (
          <div key={tab.id} className={activeTab === tab.id ? 'block' : 'hidden'}>
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}