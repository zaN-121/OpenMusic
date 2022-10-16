// Dependencies
const { Pool } = require('pg');
const { nanoid } = require('nanoid');

// Errors
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistService {
  constructor() {
    this._pool = new Pool();
  }

  async verifyIsPlaylistExist(id) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1 AND owner = $2',
      values: [id, owner],
    };
    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    const query = {
      text: `SELECT playlists.*, collaborations.user_id
      FROM playlists LEFT JOIN collaborations
      ON collaborations.playlist_id = playlists.id
      WHERE collaborations.user_id = $1 OR playlists.owner = $1 AND playlists.id = $2`,
      values: [userId, playlistId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new InvariantError('Playlist Gagal ditambahkan');
    }

    return rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username
      FROM playlists
      LEFT JOIN users ON playlists.owner = users.id
      LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };
    const { rows } = await this._pool.query(query);
    return rows;
  }

  async getPlaylistById(playlistId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
      LEFT JOIN users ON playlists.owner = users.id
      LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
      WHERE playlists.id = $1`,
      values: [playlistId],
    };
    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    return rows[0];
  }

  async getPlaylistByIdForExport(playlistId) {
    const query = {
      text: `SELECT playlists.id, playlists.name
      FROM playlists WHERE id = $1`,
      values: [playlistId],
    };
    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return rows[0];
  }

  async getPlaylistActivitiesById(id) {
    const playlistQuery = {
      text: 'SELECT id FROM playlists WHERE id = $1',
      values: [id],
    };
    const activitiesQuery = {
      text: `SELECT 
      users.username,
      songs.title,
      playlist_song_activities.action,
      playlist_song_activities.time 
      FROM playlist_song_activities LEFT JOIN
      users ON playlist_song_activities.user_id = users.id 
      LEFT JOIN songs ON playlist_song_activities.song_id = songs.id
      WHERE playlist_song_activities.playlist_id = $1`,
      values: [id],
    };
    const resultPlaylist = await this._pool.query(playlistQuery);
    const resultActivites = await this._pool.query(activitiesQuery);

    if (!resultPlaylist.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    if (!resultActivites.rows.length) {
      throw new NotFoundError('Activitas tidak ditemukan');
    }
    const playlist = resultPlaylist.rows[0];
    const activities = resultActivites.rows;

    return { playlist, activities };
  }

  async editPlaylistByid(id, { name, owner }) {
    const query = {
      text: 'UPDATE playlist SET name = $1, username = $2 WHERE id = $3 RETURNING id',
      values: [name, owner, id],
    };
    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Gagal memperbarui playlist, Id tidak ditemukan');
    }
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };
    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Gagal menghapus playlist, Id tidak ditemukan');
    }
  }
}

module.exports = PlaylistService;
