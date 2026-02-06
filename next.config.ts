import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https' as const,
        hostname: 'cygilntqbathrziuftoe.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https' as const,
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
      {
        protocol: 'https' as const,
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https' as const,
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https' as const,
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https' as const,
        hostname: 'platform-lookaside.fbsbx.com',
        pathname: '/**',
      },
      {
        protocol: 'http' as const,
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'https' as const,
        hostname: 'nippon-life.com',
        pathname: '/**',
      }
    ],
  },
  compress: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ['lucide-react', '@schedule-x/react', 'recharts'],
  },
};

export default withNextIntl(nextConfig);
