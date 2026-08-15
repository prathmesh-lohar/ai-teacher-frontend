'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'hero' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: 'bg-[var(--primary)] text-white shadow-md hover:bg-[var(--primary-hover)] shadow-[var(--primary-soft)]',
    secondary: 'bg-white text-[var(--text-heading)] border border-[var(--card-border)] shadow-sm hover:bg-gray-50',
    ghost: 'bg-transparent text-[var(--text-sub)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)]',
    hero: 'bg-white text-[#6C63FF] font-bold shadow-lg hover:bg-gray-50',
    icon: 'bg-white border border-gray-100 rounded-full flex items-center justify-center text-[var(--text-sub)] hover:text-[var(--primary)] shadow-sm',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-xl',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-8 py-3 text-sm rounded-xl font-bold',
    icon: 'w-10 h-10 rounded-full p-0',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
