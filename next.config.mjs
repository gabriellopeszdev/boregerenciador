/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const isProd = process.env.NODE_ENV === 'production';
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      {
        source: '/api/:path*',
        destination: isProd
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '')}/:path*`
          : 'http://localhost:4000/:path*',
      },
    ];
  },
}

export default nextConfig
