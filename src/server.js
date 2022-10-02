require('dotenv').config();

const Hapi = require('@hapi/hapi');
// validators
const albumsValidator = require('./validator/albums');
const songsValidator = require('./validator/songs');
// plugins
const albumsapi = require('./api/albums');
const songsapi = require('./api/songs');
// services
const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');

const albumsService = new AlbumsService();
const songsService = new SongsService();

const init = async () => {
  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });
  await server.register([
    {
      plugin: albumsapi,
      options: {
        albumsService,
        songsService,
        validator: albumsValidator,
      },
    },
    {
      plugin: songsapi,
      options: {
        service: songsService,
        validator: songsValidator,
      },
    },
  ]);
  // await server.register({
  //   plugin: songsapi,
  //   options: {
  //     service: songsService,
  //     validator: songsValidator,
  //   },
  // });
  await server.start();
  process.stdout.write(`Server berjalan pada ${server.info.uri}`);
};

init();
