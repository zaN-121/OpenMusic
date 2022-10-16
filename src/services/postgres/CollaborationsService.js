// Dependencies
const { nanoid } = require('nanoid');
const { Pool } = require('pg');

// Errors
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CollaborationsService {
  constructor() {
    this._pool = new Pool();
  }

  async verifyIsCollaborationExist(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const { rows } = await this._pool.query(query);

    if (rows[0]) {
      throw new InvariantError('Collaboration sudah ada');
    }
  }

  async addCollaboration(playlistId, userId) {
    const id = `collaboration-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO collaborations VALUES ($1, $2, $3) RETURNING Id',
      values: [id, playlistId, userId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new InvariantError('Collaborations gagal ditambahkan');
    }

    return rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };
    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Collaborations tidak ditemukan');
    }
  }
}

module.exports = CollaborationsService;
