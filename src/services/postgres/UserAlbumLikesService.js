const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UserAlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addLike(userId, albumId) {
    const id = `user_album_like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Like gagal ditambahkan');
    }

    await this._cacheService.delete(`user_album_like:${albumId}`);

    return result.rows[0].id;
  }

  async getLikesByAlbumId(albumId) {
    let dataSource;
    try {
      const result = await this._cacheService.get(`user_album_like:${albumId}`);
      dataSource = 'cache';
      return { result: JSON.parse(result), dataSource };
    } catch (error) {
      const query = {
        text: `SELECT COUNT(id) AS likes
        FROM user_album_likes
        WHERE album_id = $1`,
        values: [albumId],
      };
      const result = await this._pool.query(query);

      await this._cacheService.set(`user_album_like:${albumId}`, JSON.stringify(result.rows[0]));

      dataSource = 'database';
      return { result: result.rows[0], dataSource };
    }
  }

  async getLikeByUserIdAndAlbumId(userId, albumId) {
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Gagal menemukan like.');
    }

    return result.rows[0];
  }

  async deleteLikeById(id) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE id = $1 RETURNING album_id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Like gagal dihapus. Id tidak ditemukan');
    }

    const { album_id: albumId } = result.rows[0];
    await this._cacheService.delete(`user_album_like:${albumId}`);
  }
}

module.exports = UserAlbumLikesService;
