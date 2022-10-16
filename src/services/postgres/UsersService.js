// Dependencies
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Errors
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT * FROM users WHERE username = $1',
      values: [username],
    };

    const { rows } = await this._pool.query(query);

    if (rows[0]) {
      throw new InvariantError('Gagal menambahkan user, Username telah digunakan');
    }
  }

  async verifyIsUserExist(id) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('User tidak ditemukan');
    }
  }

  async verifyUserCredentials(username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };
    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new AuthenticationError('Kredensial yang anda masukkan salah');
    }

    const { password: hashedPassword } = rows[0];
    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Kredensial yang anda masukkan salah');
    }
    return rows[0].id;
  }

  async addUser(username, password, fullname) {
    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };
    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new InvariantError('Users gagal ditambahkan');
    }
    return rows[0].id;
  }

  async getUsers() {
    const { rows } = await this._pool.query('SELECT id, username, fullname FROM users');

    return rows;
  }

  async getUserById(id) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('User tidak ditemukan');
    }
    return rows[0];
  }

  async getUsersByUsername(username) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE username LIKE $1',
      values: [`%${username}%`],
    };
    const { rows } = await this._pool.query(query);
    return rows;
  }
}

module.exports = UsersService;
