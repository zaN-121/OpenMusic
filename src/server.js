require('dotenv').config();

// server dependencies
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

// plugins
const usersApi = require('./api/users');
const authenticationsApi = require('./api/authentications');
const albumsApi = require('./api/albums');
const songsApi = require('./api/songs');
const playlistsApi = require('./api/playlists');
const collaborationsApi = require('./api/collaborations');

// services
const UsersService = require('./services/postgres/UsersService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const PlaylistsService = require('./services/postgres/PlaylistService');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');
const PlaylistSongActivitiesService = require('./services/postgres/PlaylistSongActivitiesService');
const CollaborationsService = require('./services/postgres/CollaborationsService');

// validators
const albumsValidator = require('./validator/albums');
const authenticationsValidator = require('./validator/authentications');
const songsValidator = require('./validator/songs');
const usersValidator = require('./validator/users');
const playlistsValidator = require('./validator/playlists');
const playlistSongsValidator = require('./validator/playlistSongs');
const collaborationsValidator = require('./validator/collaborations');

// token manager
const tokenManager = require('./tokenize/TokenManager');

// error
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const playlistsService = new PlaylistsService();
  const playlistSongsService = new PlaylistSongsService();
  const playlistSongActivitiesService = new PlaylistSongActivitiesService();
  const collaborationsService = new CollaborationsService();

  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: Jwt,
  });

  await server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: usersApi,
      options: {
        usersService,
        validator: usersValidator,
      },
    },
    {
      plugin: authenticationsApi,
      options: {
        authenticationsService,
        usersService,
        tokenManager,
        validator: authenticationsValidator,
      },
    },
    {
      plugin: albumsApi,
      options: {
        albumsService,
        songsService,
        validator: albumsValidator,
      },
    },
    {
      plugin: songsApi,
      options: {
        service: songsService,
        validator: songsValidator,
      },
    },
    {
      plugin: playlistsApi,
      options: {
        playlistsService,
        songsService,
        playlistSongsService,
        playlistsValidator,
        playlistSongsValidator,
        playlistSongActivitiesService,
      },
    },
    {
      plugin: collaborationsApi,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: collaborationsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }
    return h.continue;
  });

  await server.start();
  process.stdout.write(`Server berjalan pada ${server.info.uri}`);
};

init();
