/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@support-portal/shared'],
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
