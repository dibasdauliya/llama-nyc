'use client';

import { Search, LogOut } from 'lucide-react';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();
  
  return (
    <header className="bg-white py-3 px-4 border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center">
        <div className="flex items-center mr-6">
          <Image 
            src="/gmail-logo.svg" 
            alt="Gmail" 
            width={24} 
            height={24}
            className="h-8 w-auto"
          />
          <span className="ml-2 text-2xl text-gray-600 font-light">Gmail</span>
        </div>
      </div>
      
      <div className="flex-1 max-w-2xl mx-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            className="bg-gray-100 border-none rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            placeholder="Search in emails" 
          />
        </div>
      </div>
      
      <div className="flex items-center">
        {session?.user?.email && (
          <div className="flex items-center mr-4">
            <span className="text-sm text-gray-600 mr-2">{session.user.email}</span>
            <button 
              onClick={() => signOut({ callbackUrl: '/emails' })}
              className="text-gray-600 hover:text-gray-900 flex items-center"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
          <span className="text-sm font-medium">
            {session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'}
          </span>
        </div>
      </div>
    </header>
  );
} 