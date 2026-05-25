// src/components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label className="text-sm font-medium text-gray-700">{label}</label>
    )}
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
      )}
      <input
        className={`
          w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900
          placeholder-gray-400 shadow-sm transition
          focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200
          disabled:bg-gray-50 disabled:text-gray-500
          ${icon ? 'pl-10' : ''}
          ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}
          ${className}
        `}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);
