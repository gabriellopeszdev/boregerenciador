/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
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
        source: '/api/:path*',
        destination: isProd
          ? 'https://boregerenciador.azura.dev.br:4000/:path*'
          : 'http://localhost:4000/:path*',
      },
    ];
  },
}

export default nextConfig
