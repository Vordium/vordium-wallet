// Professional Skeleton Loading Components
import React from 'react';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

// Base Skeleton Component
export const Skeleton = ({ className = '', children }: SkeletonProps) => (
  <div className={`animate-pulse bg-gray-700 rounded ${className}`}>
    {children}
  </div>
);

// Token Row Skeleton
export const TokenRowSkeleton = () => (
  <div className="w-full flex items-center gap-3 py-3 px-2 rounded-2xl">
    {/* Token Icon */}
    <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
    
    {/* Token Info */}
    <div className="flex-1 space-y-2">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-4 w-32" />
    </div>
    
    {/* Balance Info */}
    <div className="text-right space-y-2">
      <Skeleton className="h-5 w-24 ml-auto" />
      <Skeleton className="h-4 w-16 ml-auto" />
    </div>
  </div>
);

// Balance Card Skeleton
export const BalanceCardSkeleton = () => (
  <div className="bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
    {/* Total Balance */}
    <div className="text-center py-6 space-y-4">
      <Skeleton className="h-6 w-32 mx-auto" />
      <Skeleton className="h-12 w-48 mx-auto" />
      <Skeleton className="h-5 w-24 mx-auto" />
    </div>
    
    {/* Action Buttons */}
    <div className="grid grid-cols-4 gap-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex flex-col items-center gap-2 py-4 bg-gray-700 rounded-2xl border border-gray-600">
          <Skeleton className="w-6 h-6" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  </div>
);

// Wallet Card Skeleton
export const WalletCardSkeleton = () => (
  <div className="p-4 rounded-2xl border-2 border-gray-600 bg-gray-700">
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
      
      {/* Details */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-32" />
      </div>
      
      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Skeleton className="w-16 h-8 rounded-lg" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
    </div>
  </div>
);

// DApp Card Skeleton
export const DAppCardSkeleton = () => (
  <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
    <div className="flex items-center gap-3 mb-3">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);

// Form Input Skeleton
export const FormInputSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-12 w-full rounded-xl" />
  </div>
);

// Modal Skeleton
export const ModalSkeleton = () => (
  <div className="bg-gray-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
    {/* Header */}
    <div className="bg-gray-700 p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="h-7 w-32" />
      </div>
    </div>
    
    {/* Content */}
    <div className="p-6 space-y-4">
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 p-4 bg-gray-700 rounded-xl">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="w-16 h-6 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Page Skeleton
export const PageSkeleton = () => (
  <div className="min-h-screen bg-gray-900 pb-20">
    {/* Header */}
    <div className="flex items-center justify-between p-4 border-b border-gray-700">
      <div className="flex items-center gap-2">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
    </div>
    
    {/* Content */}
    <div className="p-4 space-y-6">
      <BalanceCardSkeleton />
      
      {/* Tokens Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-20" />
          <div className="flex gap-2">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>
        
        <div className="space-y-1">
          {[1, 2, 3, 4, 5].map(i => (
            <TokenRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  </div>
);
