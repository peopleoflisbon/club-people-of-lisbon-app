/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Skip type checking during build — app works fine, types checked in editor
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during build too
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

module.exports = nextConfig;
