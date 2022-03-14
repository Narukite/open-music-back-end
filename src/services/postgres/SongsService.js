const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapSongDBToSongModel } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, performer, genre, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan');
    }

    return rows[0].id;
  }

  async getSongs() {
    const { rows } = await this._pool.query('SELECT id, title, performer FROM songs');
    return rows;
  }

  async getSongsByAlbumId(albumId) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [albumId],
    };

    const { rows } = await this._pool.query(query);

    return rows;
  }

  async getSongsByTitleQuery(title) {
    const titleQuery = `%${title.toUpperCase()}%`;
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE UPPER(title) LIKE $1',
      values: [titleQuery],
    };

    const { rows } = await this._pool.query(query);

    return rows;
  }

  async getSongsByPerformerQuery(performer) {
    const performerQuery = `%${performer.toUpperCase()}%`;
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE UPPER(performer) LIKE $1',
      values: [performerQuery],
    };

    const { rows } = await this._pool.query(query);

    return rows;
  }

  async getSongsByTitleAndPerformerQuery(title, performer) {
    const titleQuery = `%${title.toUpperCase()}%`;
    const performerQuery = `%${performer.toUpperCase()}%`;
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE UPPER(title) LIKE $1 AND UPPER(performer) LIKE $2',
      values: [titleQuery, performerQuery],
    };

    const { rows } = await this._pool.query(query);

    return rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }

    return rows.map(mapSongDBToSongModel)[0];
  }

  async editSongById(id, {
    title, year, performer, genre, duration, albumId,
  }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui Song. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyExistingSong(id) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Gagal menemukan song.');
    }
  }
}

module.exports = SongsService;
