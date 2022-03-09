class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, usersService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._usersService = usersService;
    this._validator = validator;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
  }

  async postCollaborationHandler({ payload, auth: { credentials } }, h) {
    try {
      this._validator.validateCollaborationPayload(payload);
      const { id: credentialId } = credentials;
      const { playlistId, userId } = payload;

      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
      await this._usersService.verifyExistingUser(userId);
      const collaborationId = await this._collaborationsService
        .addCollaboration(playlistId, userId);

      const response = h.response({
        status: 'success',
        message: 'Kolaborasi berhasil ditambahkan',
        data: {
          collaborationId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async deleteCollaborationHandler({ payload, auth: { credentials } }) {
    try {
      this._validator.validateCollaborationPayload(payload);
      const { id: credentialId } = credentials;
      const { playlistId, userId } = payload;

      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
      await this._collaborationsService.deleteCollaboration(playlistId, userId);

      return {
        status: 'success',
        message: 'Kolaborasi berhasil dihapus',
      };
    } catch (error) {
      return error;
    }
  }
}

module.exports = CollaborationsHandler;
