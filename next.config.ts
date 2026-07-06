import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fexoyvcwbignzctklehd.supabase.co', // Ini biarkan saja (untuk foto profil admin)
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Ini tambahan baru untuk gambar pemandangan
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;