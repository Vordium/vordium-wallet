'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2',
  lg: 'px-5 py-3 text-base',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700',
  secondary: 'border border-gray-300 text-gray-900 hover:bg-gray-50',
  icon: 'p-2 border border-gray-300 text-gray-700 hover:bg-gray-50',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'rounded-lg transition transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed';
  return (
    <button
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Processing…' : children}
    </button>
  );
}


