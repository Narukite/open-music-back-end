class PlaylistActivitiesHandler {
  constructor(playlistsService, activitiesService) {
    this._playlistsService = playlistsService;
    this._activitiesService = activitiesService;

    this.getPlaylistActivitiesHandler = this.getPlaylistActivitiesHandler.bind(this);
  }

  async getPlaylistActivitiesHandler({ params, auth: { credentials } }) {
    const { id: playlistId } = params;
    const { id: credentialId } = credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    const activities = await this._activitiesService.getActivities(playlistId);

    return {
      status: 'success',
      data: {
        playlistId, activities,
      },
    };
  }
}

module.exports = PlaylistActivitiesHandler;
