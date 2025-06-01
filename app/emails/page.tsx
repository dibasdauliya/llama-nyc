// app/emails/page.tsx

'use client';

import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import EmailList from './components/EmailList';
import EmailDetail from './components/EmailDetail';
import ComposeEmail from './components/ComposeEmail';

export default function EmailsPage() {
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<'inbox' | 'sent'>('inbox');
  const [isComposing, setIsComposing] = useState(false);

  return (
    <SessionProvider>
      <div className="flex flex-col h-screen bg-gray-50">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar 
            currentTab={currentTab} 
            setCurrentTab={setCurrentTab} 
            onCompose={() => setIsComposing(true)}
          />
          <div className="flex flex-col flex-1 overflow-hidden">
            {selectedEmail ? (
              <EmailDetail 
                email={selectedEmail} 
                onBack={() => setSelectedEmail(null)} 
              />
            ) : (
              <EmailList 
                type={currentTab} 
                onSelectEmail={setSelectedEmail} 
              />
            )}
          </div>
        </div>
        
        {isComposing && (
          <ComposeEmail onClose={() => setIsComposing(false)} />
        )}
      </div>
    </SessionProvider>
  );
}
