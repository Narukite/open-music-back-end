class AlbumLikesHandler {
  constructor(likesService, albumsService) {
    this._likesService = likesService;
    this._albumsService = albumsService;

    this.postAlbumLikeHandler = this.postAlbumLikeHandler.bind(this);
    this.getAlbumLikesHandler = this.getAlbumLikesHandler.bind(this);
  }

  async postAlbumLikeHandler({ params, auth: { credentials } }, h) {
    try {
      const { id: albumId } = params;
      const { id: userId } = credentials;
      let message;

      await this._albumsService.verifyExistingAlbum(albumId);
      try {
        const { id } = await this._likesService.getLikeByUserIdAndAlbumId(userId, albumId);
        await this._likesService.deleteLikeById(id);
        message = 'Like berhasil dihapus';
      } catch (error) {
        await this._likesService.addLike(userId, albumId);
        message = 'Like berhasil ditambahkan';
      }

      const response = h.response({
        status: 'success',
        message,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async getAlbumLikesHandler({ params }, h) {
    const { id: albumId } = params;

    const { result: { likes: likesInString }, dataSource } = await this._likesService
      .getLikesByAlbumId(albumId);
    const likes = parseInt(likesInString, 10);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    response.header('X-Data-Source', dataSource);
    return response;
  }
}

module.exports = AlbumLikesHandler;
