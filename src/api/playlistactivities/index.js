const PlaylistActivitiesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistActivities',
  version: '1.0.0',
  register: async (server, { playlistsService, activitiesService }) => {
    const playlistActivitiesHandler = new PlaylistActivitiesHandler(
      playlistsService,
      activitiesService,
    );
    server.route(routes(playlistActivitiesHandler));
  },
};
