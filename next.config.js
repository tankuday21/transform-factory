/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure experimental features
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'pdf-lib', 'docx', 'xlsx', 'ffmpeg-static'],
  },
  transpilePackages: ['pdf-lib'],
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `canvas` module
    if (isServer) {
      config.externals.push({
        canvas: 'commonjs canvas',
        'canvas/build/Release/canvas.node': 'commonjs canvas/build/Release/canvas.node',
      });
    }

    // Exclude binary files from being processed by webpack
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    return config;
  },
}

module.exports = nextConfig 