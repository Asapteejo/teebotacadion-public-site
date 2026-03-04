#!/usr/bin/env node

const isProductionEnv =
  process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '';

if (isProductionEnv && !apiBase) {
  console.error('[PUBLIC SITE ENV] NEXT_PUBLIC_API_BASE_URL (preferred) or NEXT_PUBLIC_BACKEND_URL is required in production.');
  process.exit(1);
}

if (isProductionEnv && /onrender\.com/i.test(apiBase)) {
  console.error('[PUBLIC SITE ENV] Production API base must not point to onrender.com');
  process.exit(1);
}

console.log('[PUBLIC SITE ENV] OK');
