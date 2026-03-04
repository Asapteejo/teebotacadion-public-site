'use client'; // ← Required for Framer Motion (client-side animations)

import Link from 'next/link';
import { motion } from 'framer-motion';

type CtaButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  delay?: number; // Optional: for staggering multiple buttons
};

export default function CtaButton({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  delay = 0,
}: CtaButtonProps) {
  const baseStyles =
    'inline-block font-semibold rounded-md transition-all duration-300 hover:scale-105 hover:shadow-lg';

  const variantStyles = {
    primary: 'bg-accent text-white hover:bg-opacity-90',
    secondary: 'bg-primary text-white hover:bg-primaryDark',
    light: 'bg-white text-primary hover:bg-opacity-90',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
      whileHover={{ 
        scale: 1.05, 
        y: -4,
        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)',
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={href}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      >
        {children}
      </Link>
    </motion.div>
  );
}