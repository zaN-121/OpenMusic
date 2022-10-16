// Dependencies
const { Pool } = require('pg');
const { nanoid } = require('nanoid');

// Error
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistSongActivitie(
    playlist_id,
    song_id,
    user_id,
    action,
  ) {
    const id = `pl-sg-act-${nanoid(16)}`;

    const query = {
      text: `INSERT INTO playlist_song_activities
      VALUES($1, $2, $3, $4, $5) RETURNING id`,
      values: [id, playlist_id, song_id, user_id, action],
    };
    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new InvariantError('Aktivitas gagal ditambahkan');
    }
    return rows[0];
  }
}

module.exports = PlaylistSongActivitiesService;
