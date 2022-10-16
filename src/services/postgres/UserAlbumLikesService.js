const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class UserAlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addLike(albumId, userId) {
    const id = `usr-albm-lks-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };
    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new InvariantError('Gagal menyukai album');
    }
    await this._cacheService.delete(`cache:${albumId}`);
  }

  async unlike(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new InvariantError('Gagal membatalkan suka');
    }

    await this._cacheService.delete(`cache:${albumId}`);
  }

  async getAlbumLikes(albumId) {
    let result = await this._cacheService.get(`cache:${albumId}`);

    if (result === null) {
      const query = {
        text: 'SELECT * from user_album_likes WHERE album_id = $1',
        values: [albumId],
      };
      const { rows } = await this._pool.query(query);
      await this._cacheService.set(`cache:${albumId}`, rows.length);
      result = rows.length;
    }
    return result;
  }
}

module.exports = UserAlbumLikesService;
