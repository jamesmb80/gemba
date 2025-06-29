/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['placehold.co'],
  },
  webpack: (config, { isServer }) => {
    // Handle PDF.js worker
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        stream: false,
        crypto: false,
      };
    }
    
    return config;
  },
}

module.exports = nextConfig