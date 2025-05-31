'use client';

import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ApiKeyMissing() {
  return (
    <div className="mt-2 p-4 bg-amber-50 rounded-md border border-amber-200">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-amber-800">Llama API Key Not Configured</h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              To use the AI summarization feature, you need to add a Llama API key to your server environment.
            </p>
            <ol className="list-decimal ml-5 mt-2 space-y-1">
              <li>Get an API key from <a href="https://www.llama.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">llama.com</a></li>
              <li>Add it to your .env.local file: <code className="bg-amber-100 px-1 py-0.5 rounded">LLAMA_API_KEY=your_key_here</code></li>
              <li>Restart your development server</li>
            </ol>
            <p className="mt-2">
              <Link href="/emails/AUTH-SETUP.md" className="text-amber-800 hover:text-amber-900 font-medium underline">
                See the setup guide
              </Link> for more detailed instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 