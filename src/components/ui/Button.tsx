'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gray-600 text-white hover:bg-gray-500 active:scale-95 disabled:bg-gray-700 disabled:text-gray-500',
  secondary: 'bg-gray-700 text-white border-2 border-gray-600 hover:bg-gray-600 active:scale-95 disabled:bg-gray-800 disabled:text-gray-500',
  danger: 'bg-gray-600 text-white hover:bg-gray-500 active:scale-95 disabled:bg-gray-700 disabled:text-gray-500',
  ghost: 'bg-transparent text-gray-300 hover:bg-gray-700 active:scale-95 disabled:text-gray-500',
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
  const base = 'rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2';
  return (
    <button
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className} ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Processing…' : children}
    </button>
  );
}


