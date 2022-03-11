class ExportsHandler {
  constructor(exportsService, playlistsService, validator) {
    this._exportsService = exportsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
  }

  async postExportPlaylistHandler({ payload, params, auth: { credentials } }, h) {
    try {
      this._validator.validateExportPlaylistPayload(payload);

      const { playlistId } = params;
      const { id: userId } = credentials;
      const message = {
        playlistId,
        targetEmail: payload.targetEmail,
      };

      await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
      await this._exportsService.sendMessage('export:playlist', JSON.stringify(message));

      const response = h.response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }
}

module.exports = ExportsHandler;
