import React from 'react';

export function Input({ label, id, type = 'text', value, onChange, placeholder, className = '', error, ...props }) {
  return (
    <div className="mb-4">
      {label && <label htmlFor={id} className="block text-sm font-medium text-white/90 mb-1">{label}</label>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-white/50 backdrop-blur-xl ${error ? 'border-red-400/50' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-300">{error}</p>}
    </div>
  );
}

