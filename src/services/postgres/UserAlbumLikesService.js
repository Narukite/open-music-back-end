const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UserAlbumLikesService {
  constructor() {
    this._pool = new Pool();
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

    return result.rows[0].id;
  }

  async getLikesByAlbumId(albumId) {
    const query = {
      text: `SELECT COUNT(id) AS likes
      FROM user_album_likes
      WHERE album_id = $1`,
      values: [albumId],
    };
    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async getLikeByUserIdAndAlbumId(userId, albumId) {
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('Gagal menemukan like.');
    }

    return result.rows[0];
  }

  async deleteLikeById(id) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Like gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = UserAlbumLikesService;
