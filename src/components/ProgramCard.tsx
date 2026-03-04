'use client'; // ← Required for Framer Motion (client-side animations)

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

type ProgramCardProps = {
  title: string;
  description: string;
  link: string;
  linkText: string;
  image?: string; // Now dynamic URL from CMS (e.g., https://storage.com/program.jpg)
};

export default function ProgramCard({
  title,
  description,
  link,
  linkText,
  image,
}: ProgramCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{ 
        y: -8, 
        scale: 1.03,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        transition: { duration: 0.3 }
      }}
      className="bg-white rounded-lg overflow-hidden shadow-soft group cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative h-64 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
        {image ? (
          <Image
            src={image} // Dynamic URL from CMS
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto text-primary/40 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span className="text-primary/60 font-serif">{title}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-8">
        <h3 className="text-3xl font-serif mb-4 text-primary group-hover:text-accent transition-colors duration-300">
          {title}
        </h3>
        <p className="text-textLight mb-6 leading-relaxed">{description}</p>
        <Link
          href={link}
          className="inline-flex items-center text-accent font-semibold hover:underline group-hover:translate-x-1 transition-transform duration-300"
        >
          {linkText}
          <svg
            className="w-5 h-5 ml-2"
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
      </div>
    </motion.div>
  );
}
