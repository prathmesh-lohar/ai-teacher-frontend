import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'grammar' | 'speaking' | 'vocabulary' | 'success';
  children: React.ReactNode;
}

export function Badge({ variant = 'primary', className, children, ...props }: BadgeProps) {
  const variantStyles = {
    primary: 'bg-[var(--primary-soft)] text-[var(--primary)]',
    secondary: 'bg-gray-100 text-[var(--text-sub)]',
    grammar: 'bg-orange-100 text-orange-600',
    speaking: 'bg-blue-100 text-blue-600',
    vocabulary: 'bg-purple-100 text-purple-600',
    success: 'bg-green-100 text-green-700',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
