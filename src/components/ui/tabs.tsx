import React from 'react';

interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { id: string; label: string }[];
}

export function Tabs({ activeTab, onTabChange, tabs }: TabsProps) {
  return (
    <div className="flex border-b border-gray-200 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`py-2 px-4 text-sm font-medium transition-colors border-b-2 -mb-[2px] ${activeTab === tab.id
              ? 'border-[#001F3F] text-[#001F3F]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
