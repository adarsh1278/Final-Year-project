/** @type {import('next').NextConfig} */



const withNextIntl = require('next-intl/plugin')(
  './i18n.js' // Adjust path if you're using JS
);
module.exports = withNextIntl();


const nextConfig = {
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
