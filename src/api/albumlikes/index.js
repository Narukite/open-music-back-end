const AlbumLikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albumLikes',
  version: '1.0.0',
  register: async (server, { likesService, albumsService }) => {
    const albumLikesHandler = new AlbumLikesHandler(
      likesService,
      albumsService,
    );
    server.route(routes(albumLikesHandler));
  },
};
