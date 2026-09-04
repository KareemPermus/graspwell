import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function SupportFab() {
  return (
    <button
      className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg flex items-center justify-center z-30 transition-colors"
      title="Support"
    >
      <MessageCircle className="w-5 h-5" />
    </button>
  );
}