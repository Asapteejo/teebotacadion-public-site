'use client'; // ← Required for Framer Motion (client-side animations)

import Link from 'next/link';
import { motion } from 'framer-motion';

type HeroSectionProps = {
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaHref: string;
  backgroundImage?: string; // Now dynamic from CMS
};

export default function HeroSection({
  title,
  subtitle,
  ctaText,
  ctaHref,
  backgroundImage,
}: HeroSectionProps) {
  return (
    <section className="relative h-[600px] md:h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: backgroundImage
            ? `url(${backgroundImage})` // Dynamic URL from CMS
            : 'linear-gradient(135deg, #7a1f1f 0%, #5a1515 100%)', // Your fallback gradient
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-5xl md:text-6xl lg:text-7xl font-serif font-normal mb-6"
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="text-xl md:text-2xl lg:text-3xl mb-8 opacity-90"
          >
            {subtitle}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
        >
          <Link
            href={ctaHref}
            className="inline-block px-10 py-4 bg-accent text-white rounded-md font-semibold text-lg hover:bg-opacity-90 hover:scale-105 transition-all duration-300 shadow-lg"
          >
            {ctaText}
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={{ duration: 1.2, delay: 0.8 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
      >
        <svg
          className="w-6 h-6 text-white opacity-75"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </motion.div>
    </section>
  );
}