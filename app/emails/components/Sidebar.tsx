'use client';

import { Inbox, Send, Edit, Trash } from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  currentTab: 'inbox' | 'sent';
  setCurrentTab: (tab: 'inbox' | 'sent') => void;
  onCompose: () => void;
}

export default function Sidebar({ currentTab, setCurrentTab, onCompose }: SidebarProps) {
  const menuItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: 12 },
    { id: 'sent', label: 'Sent', icon: Send, count: 0 },
  ];
  
  const otherItems = [
    { id: 'drafts', label: 'Drafts', icon: Edit, count: 2 },
    { id: 'trash', label: 'Trash', icon: Trash, count: 0 },
  ];

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
      <div className="p-4">
        <button 
          onClick={onCompose}
          className="bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full px-6 py-3 w-full font-medium flex items-center justify-center"
        >
          <Edit className="h-5 w-5 mr-2" />
          Compose
        </button>
      </div>
      
      <nav>
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setCurrentTab(item.id as 'inbox' | 'sent')}
                className={clsx(
                  'flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium',
                  currentTab === item.id 
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count > 0 && (
                  <span className="bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">
                    {item.count}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
        
        <div className="border-t border-gray-200 my-4"></div>
        
        <ul className="space-y-1 px-2">
          {otherItems.map((item) => (
            <li key={item.id}>
              <button
                className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count > 0 && (
                  <span className="bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">
                    {item.count}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
} 