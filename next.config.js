/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure experimental features
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'pdf-lib', 'docx', 'xlsx', 'ffmpeg-static'],
  },
}

module.exports = nextConfig 