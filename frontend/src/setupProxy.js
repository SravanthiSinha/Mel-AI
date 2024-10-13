const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/handleupload',
    createProxyMiddleware({
      target: 'http://api.twelvelabs.io',
      changeOrigin: true,
    })
  );

  app.use(
    '/api/handledub',
    createProxyMiddleware({
      target: 'http://127.0.0.1:5000',
      changeOrigin: true,
    })
  );

};
