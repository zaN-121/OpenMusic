// Dependencies
const { nanoid } = require('nanoid');
const { Pool } = require('pg');

// Errors
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async verifyIsAlbumExist(albumId) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [albumId],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }

  async verifyDidUserLikedAlbum(albumId, userId) {
    const query = {
      text: `SELECT albums.id, user_album_likes.user_id 
      FROM albums LEFT JOIN user_album_likes 
      ON albums.id = user_album_likes.album_id
      WHERE albums.id = $1 AND user_album_likes.user_id = $2`,
      values: [albumId, userId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      return false;
    }
    return true;
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };
    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }
    return rows[0].id;
  }

  async getAlbumById(albumId) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [albumId],
    };
    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    const albums = rows.map(({
      id,
      name,
      year,
      cover_url,
    }) => ({
      id,
      name,
      year,
      coverUrl: cover_url,
    }));
    return albums[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };
    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Gagal memperbarui album, Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Gagal menghapus album, Id tidak ditemukan');
    }
  }

  async addAlbumCoverImageUrl(id, url) {
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [url, id],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Albums tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
