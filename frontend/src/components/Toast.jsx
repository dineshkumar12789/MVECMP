import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  const bgStyles = {
    success: 'bg-emerald-900 text-emerald-100 border-emerald-700',
    error: 'bg-rose-900 text-rose-100 border-rose-700',
    info: 'bg-blue-900 text-blue-100 border-blue-700',
    warning: 'bg-amber-900 text-amber-100 border-amber-700',
  }[type] || 'bg-gray-900 text-white border-gray-700';

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle,
  }[type] || Info;

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl transition-all duration-300 animate-slide-up ${bgStyles}`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium pr-2">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
