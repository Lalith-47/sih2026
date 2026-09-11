/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://infratrack-backend-l1d3.onrender.com'}/api/auth/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
