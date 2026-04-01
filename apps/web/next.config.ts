import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@support-portal/shared'],
  async rewrites() {
    return {
      beforeFiles: [
        // Proxy API calls to the Express backend, except NextAuth routes
        {
          source: '/api/:path((?!auth).*)',
          destination:
            (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') +
            '/api/:path*',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
