/** @type {import('next').NextConfig} */
const backendUrl = (process.env.BACKEND_URL || 'http://localhost:4000').replace(/\/+$/, '');

const nextConfig = {
  agentRules: false,
  async rewrites() {
    return [{
      source: '/api/:path*',
      destination: `${backendUrl}/api/:path*`,
    }];
  },
};

export default nextConfig;
