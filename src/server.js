require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

const playlistSongs = require('./api/playlistsongs');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');
const PlaylistSongsValidator = require('./validator/playlistsongs');

const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

const playlistActivities = require('./api/playlistactivities');
const PlaylistSongActivitiesService = require('./services/postgres/PlaylistSongActivitiesService');

const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/uploads');

const albumLikes = require('./api/albumlikes');
const UserAlbumLikesService = require('./services/postgres/UserAlbumLikesService');

const ClientError = require('./exceptions/ClientError');
const AuthenticationError = require('./exceptions/AuthenticationError');
const NotFoundError = require('./exceptions/NotFoundError');
const RequestEntityTooLargeError = require('./exceptions/RequestEntityTooLargeError');

const init = async () => {
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistSongsService = new PlaylistSongsService();
  const activitiesService = new PlaylistSongActivitiesService();
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/albums/covers'));
  const likesService = new UserAlbumLikesService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([{
    plugin: Jwt,
  }, {
    plugin: Inert,
  },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
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

  await server.register([{
    plugin: albums,
    options: {
      albumsService,
      songsService,
      validator: AlbumsValidator,
    },
  }, {
    plugin: songs,
    options: {
      service: songsService,
      validator: SongsValidator,
    },
  }, {
    plugin: users,
    options: {
      service: usersService,
      validator: UsersValidator,
    },
  },
  {
    plugin: authentications,
    options: {
      authenticationsService,
      usersService,
      tokenManager: TokenManager,
      validator: AuthenticationsValidator,
    },
  }, {
    plugin: playlists,
    options: {
      service: playlistsService,
      validator: PlaylistsValidator,
    },
  }, {
    plugin: playlistSongs,
    options: {
      playlistSongsService,
      playlistsService,
      songsService,
      activitiesService,
      validator: PlaylistSongsValidator,
    },
  }, {
    plugin: collaborations,
    options: {
      collaborationsService,
      playlistsService,
      usersService,
      validator: CollaborationsValidator,
    },
  }, {
    plugin: playlistActivities,
    options: {
      playlistsService,
      activitiesService,
    },
  }, {
    plugin: _exports,
    options: {
      exportsService: ProducerService,
      playlistsService,
      validator: ExportsValidator,
    },
  }, {
    plugin: uploads,
    options: {
      storageService,
      albumsService,
      validator: UploadsValidator,
    },
  }, {
    plugin: albumLikes,
    options: {
      likesService,
      albumsService,
    },
  },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    if (response.output !== undefined) {
      const { statusCode } = response.output;
      if (statusCode === 401) {
        const error = new AuthenticationError('Missing authentication');
        const newResponse = h.response({
          status: 'fail',
          message: error.message,
        });
        newResponse.code(error.statusCode);
        return newResponse;
      }
      if (statusCode === 404) {
        const error = new NotFoundError('Not Found');
        const newResponse = h.response({
          status: 'fail',
          message: error.message,
        });
        newResponse.code(error.statusCode);
        return newResponse;
      }
      if (statusCode === 413) {
        const error = new RequestEntityTooLargeError('Payload content length greater than maximum allowed: 512000');
        const newResponse = h.response({
          status: 'fail',
          message: error.message,
        });
        newResponse.code(error.statusCode);
        return newResponse;
      }
    }

    if (response instanceof Error) {
      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      newResponse.code(500);
      console.error(response);
      return newResponse;
    }

    return response.continue || response;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
