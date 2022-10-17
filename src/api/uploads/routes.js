const path = require('path');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums/{albumId}/covers',
    handler: handler.postAlbumCoverImageHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        maxBytes: 512000,
        multipart: true,
        output: 'stream',
      },
    },
  },
  {
    method: 'GET',
    path: '/upload/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, 'file'),
      },
    },
  },
];

module.exports = routes;
