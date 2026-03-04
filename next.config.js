// next.config.js

/** @type {import('next').NextConfig} */
const toRemotePattern = (rawUrl, pathname = '/**') => {
  if (!rawUrl) return null;
  try {
    const parsed = new URL(rawUrl);
    return {
      protocol: parsed.protocol.replace(':', ''),
      hostname: parsed.hostname,
      ...(parsed.port ? { port: parsed.port } : {}),
      pathname,
    };
  } catch {
    return null;
  }
};

const remotePatterns = [
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '4000',
    pathname: '/uploads/**',
  },
  {
    protocol: 'https',
    hostname: 'localhost',
    pathname: '/uploads/**',
  },
];

[
  toRemotePattern(process.env.NEXT_PUBLIC_BACKEND_URL, '/uploads/**'),
  toRemotePattern(process.env.NEXT_PUBLIC_API_BASE_URL, '/uploads/**'),
  toRemotePattern(process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL, '/**'),
  toRemotePattern(process.env.R2_PUBLIC_BASE_URL, '/**'),
].filter(Boolean).forEach((pattern) => remotePatterns.push(pattern));

const nextConfig = {
  images: {
    remotePatterns,
  },
};

module.exports = nextConfig;
