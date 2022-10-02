const ClientError = require('../../exceptions/ClientError');

/* eslint-disable no-underscore-dangle */
class SongsHandler {
  constructor(songsService, validator) {
    this._songsService = songsService;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const songId = await this._songsService.addSong(request.payload);
      const response = h.response({
        status: 'success',
        data: {
          songId,
        },
      });
      response.code(201);
      return response;
    } catch (err) {
      if (err instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: err.message,
        });
        response.code(err.statusCode);
        return response;
      }
      const response = h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server kami',
      });
      response.code(500);
      return response;
    }
  }

  async getSongsHandler(request, h) {
    try {
      let songs = await this._songsService.getSongs();
      const { query } = request;
      if (query.title) {
        const { title } = query;
        songs = songs.filter((song) => song.title.toLowerCase().includes(title.toLowerCase()));
      }
      if (query.performer) {
        const { performer } = query;
        songs = songs.filter(
          (song) => song.performer.toLowerCase().includes(performer.toLowerCase()),
        );
      }
      const response = h.response({
        status: 'success',
        data: {
          songs,
        },
      });
      response.code(200);
      return response;
    } catch (err) {
      if (err instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: err.message,
        });
        response.code(err.statusCode);
        return response;
      }
      const response = h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server kami',
      });
      response.code(500);
      return response;
    }
  }

  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const song = await this._songsService.getSongById(id, request.payload);
      const response = h.response({
        status: 'success',
        data: {
          song,
        },
      });
      response.code(200);
      return response;
    } catch (err) {
      if (err instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: err.message,
        });
        response.code(err.statusCode);
        return response;
      }
      const response = h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server kami',
      });
      response.code(500);
      return response;
    }
  }

  async putSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const { id } = request.params;
      await this._songsService.editSongById(id, request.payload);
      const response = h.response({
        status: 'success',
        message: 'Berhasil mengedit Lagu',
      });
      response.code(200);
      return response;
    } catch (err) {
      if (err instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: err.message,
        });
        response.code(err.statusCode);
        return response;
      }
      const response = h.response({
        status: 'error',
        message: err.message,
      });
      response.code(500);
      return response;
    }
  }

  async deleteSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._songsService.deleteSongById(id, request.payload);
      const response = h.response({
        status: 'success',
        message: 'Berhasil menghapus Lagu',
      });
      response.code(200);
      return response;
    } catch (err) {
      if (err instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: err.message,
        });
        response.code(err.statusCode);
        return response;
      }
      const response = h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server kami',
      });
      response.code(500);
      return response;
    }
  }
}

module.exports = SongsHandler;
