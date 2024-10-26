// workbox-config.js
module.exports = {
    globDirectory: 'dist/',
    globPatterns: [
      '**/*.{js,css,html,png,jpg,svg,webp}',
    ],
    swDest: 'dist/sw.js',
    runtimeCaching: [{
      urlPattern: /^https:\/\/your-api-domain\.com\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
      },
    }],
  };
  