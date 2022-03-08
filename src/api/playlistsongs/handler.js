class PlaylistSongsHandler {
  constructor(playlistSongsService, playlistsService, songsService, activitiesService, validator) {
    this._playlistSongsService = playlistSongsService;
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._activitiesService = activitiesService;
    this._validator = validator;

    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
    this.deletePlaylistSongByIdHandler = this.deletePlaylistSongByIdHandler.bind(this);
  }

  async postPlaylistSongHandler(request, h) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload);
      const { songId } = request.payload;
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._songsService.verifyExistingSong(songId);
      await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
      const playlistSongId = await this._playlistSongsService.addPlaylistSong({
        playlistId, songId,
      });
      const action = 'add';
      await this._activitiesService.addActivity(playlistId, songId, credentialId, action);

      const response = h.response({
        status: 'success',
        message: 'PlaylistSong berhasil ditambahkan',
        data: {
          playlistSongId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async getPlaylistSongsHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    const requestedPlaylist = await this._playlistsService.getPlaylistById(playlistId);
    const songsOfRequestedPlaylist = await this._playlistSongsService
      .getPlaylistSongs(playlistId);
    const playlist = { ...requestedPlaylist, songs: songsOfRequestedPlaylist };

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistSongByIdHandler(request) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload);
      const { songId } = request.payload;
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
      await this._playlistSongsService.deletePlaylistSongById(playlistId, songId);
      const action = 'delete';
      await this._activitiesService.addActivity(playlistId, songId, credentialId, action);

      return {
        status: 'success',
        message: 'PlaylistSong berhasil dihapus',
      };
    } catch (error) {
      return error;
    }
  }
}

module.exports = PlaylistSongsHandler;
