class AlbumsHandler {
  constructor(albumsService, songsService, validator) {
    this._albumsService = albumsService;
    this._songsService = songsService;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  }

  async postAlbumHandler({ payload }, h) {
    try {
      this._validator.validateAlbumPayload(payload);

      const albumId = await this._albumsService.addAlbum(payload);

      const response = h.response({
        status: 'success',
        message: 'Album berhasil ditambahkan',
        data: {
          albumId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async getAlbumByIdHandler({ params }) {
    try {
      const { id } = params;

      const requestedAlbum = await this._albumsService.getAlbumById(id);
      const songsOfRequestedAlbum = await this._songsService.getSongsByAlbumId(id);
      const album = { ...requestedAlbum, songs: songsOfRequestedAlbum };

      return {
        status: 'success',
        data: {
          album,
        },
      };
    } catch (error) {
      return error;
    }
  }

  async putAlbumByIdHandler({ payload, params }) {
    try {
      this._validator.validateAlbumPayload(payload);
      const { id } = params;

      await this._albumsService.editAlbumById(id, payload);

      return {
        status: 'success',
        message: 'Catatan berhasil diperbarui',
      };
    } catch (error) {
      return error;
    }
  }

  async deleteAlbumByIdHandler({ params }) {
    try {
      const { id } = params;

      await this._albumsService.deleteAlbumById(id);

      return {
        status: 'success',
        message: 'Catatan berhasil dihapus',
      };
    } catch (error) {
      return error;
    }
  }
}

module.exports = AlbumsHandler;
