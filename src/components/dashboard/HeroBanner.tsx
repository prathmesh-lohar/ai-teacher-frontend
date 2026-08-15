'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onStart?: () => void;
}

export function HeroBanner({
  title = "Sharpen Your English Skills with AI",
  subtitle = "Master grammar, expand your academic vocabulary, and practice natural speaking with your dedicated AI tutor duo anytime, anywhere.",
  buttonText = "Start Learning Now",
  onStart,
}: HeroBannerProps) {
  return (
    <section aria-label="Welcome Banner" className="hero-gradient rounded-[28px] p-8 lg:p-10 text-white relative overflow-hidden shadow-lg shadow-purple-500/20">
      <div className="relative z-10 w-full lg:w-3/4">
        {/* Main SEO H1 Tag */}
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-3 leading-tight tracking-tight drop-shadow-sm">
          {title}
        </h1>
        <p className="text-white/90 text-xs sm:text-sm mb-6 max-w-lg leading-relaxed font-normal">
          {subtitle}
        </p>
        <Button 
          variant="hero"
          size="lg"
          onClick={onStart}
          aria-label={buttonText}
        >
          {buttonText}
        </Button>
      </div>

      {/* Decorative Star Vector */}
      <div className="absolute right-[-30px] bottom-[-30px] opacity-15 transform rotate-12 pointer-events-none hidden sm:block">
        <Star size={280} fill="white" stroke="none" />
      </div>
    </section>
  );
}

export default HeroBanner;
