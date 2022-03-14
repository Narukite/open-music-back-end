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

  async postPlaylistSongHandler({ payload, params, auth: { credentials } }, h) {
    try {
      this._validator.validatePlaylistSongPayload(payload);
      const { songId } = payload;
      const { id: playlistId } = params;
      const { id: credentialId } = credentials;

      await this._songsService.verifyExistingSong(songId);
      await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
      const playlistSongId = await this._playlistSongsService.addPlaylistSong(playlistId, songId);
      await this._activitiesService.addActivity(playlistId, songId, credentialId, 'add');

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

  async getPlaylistSongsHandler({ params, auth: { credentials } }) {
    const { id: playlistId } = params;
    const { id: credentialId } = credentials;

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

  async deletePlaylistSongByIdHandler({ payload, params, auth: { credentials } }) {
    try {
      this._validator.validatePlaylistSongPayload(payload);
      const { songId } = payload;
      const { id: playlistId } = params;
      const { id: credentialId } = credentials;

      await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
      await this._playlistSongsService.deletePlaylistSongById(playlistId, songId);
      await this._activitiesService.addActivity(playlistId, songId, credentialId, 'delete');

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
