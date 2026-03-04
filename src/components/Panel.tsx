'use client'; // ← Required for Framer Motion (client-side animations)

import Link from 'next/link';
import { motion } from 'framer-motion';

type PanelProps = {
  id: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  link?: string;
  linkText?: string;
  bgColor?: 'white' | 'neutral';
};

export default function Panel({
  id,
  title,
  description,
  children,
  link,
  linkText,
  bgColor = 'white',
}: PanelProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`py-20 ${bgColor === 'white' ? 'bg-white' : 'bg-neutral'}`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-serif mb-6 text-primary">{title}</h2>

        {description && (
          <p className="text-lg text-textLight mb-8 leading-relaxed max-w-3xl">
            {description}
          </p>
        )}

        {children && <div className="mb-8">{children}</div>}

        {link && linkText && (
          <Link
            href={link}
            className="inline-flex items-center text-accent font-semibold text-lg hover:underline group"
          >
            {linkText}
            <svg
              className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        )}
      </div>
    </motion.section>
  );
}