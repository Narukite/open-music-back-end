class UploadsHandler {
  constructor(storageService, albumsService, validator) {
    this._storageService = storageService;
    this._albumsService = albumsService;
    this._validator = validator;

    this.postAlbumCoverHandle = this.postAlbumCoverHandle.bind(this);
  }

  async postAlbumCoverHandle(request, h) {
    try {
      const { cover } = request.payload;
      const { id: albumId } = request.params;
      this._validator.validateImageHeaders(cover.hapi.headers);

      const filename = await this._storageService.writeFile(cover, cover.hapi);
      const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/albums/covers/${filename}`;
      await this._albumsService.editCoverUrlOfAlbumById(albumId, coverUrl);

      const response = h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }
}

module.exports = UploadsHandler;
