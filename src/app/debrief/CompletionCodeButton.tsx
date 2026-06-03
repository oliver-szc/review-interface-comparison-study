'use client';

import { useState } from 'react';

interface CompletionCodeButtonProps {
  code: string;
}

export function CompletionCodeButton({ code }: CompletionCodeButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleCopy}
        className="font-mono bg-white hover:bg-blue-50/50 active:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded px-4 py-2 text-blue-700 hover:text-blue-900 font-bold tracking-wider transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        title="Click to copy completion code"
      >
        {code}
      </button>
      <p className={`text-xs mt-2 italic transition-colors duration-200 ${copied ? 'text-green-600 font-semibold' : 'text-blue-600'}`}>
        {copied ? '✓ Copied to clipboard' : 'Click to copy the code'}
      </p>
    </div>
  );
}
