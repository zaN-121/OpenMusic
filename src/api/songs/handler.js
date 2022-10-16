// dependencies
const autoBind = require('auto-bind');

class SongsHandler {
  constructor(songsService, validator) {
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const songId = await this._songsService.addSong(request.payload);

    return h.response({
      status: 'success',
      data: {
        songId,
      },
    }).code(201);
  }

  async getSongsHandler(request) {
    if (request.query) {
      const songs = await this._songsService.getSongsByQuery(request.query);
      return {
        status: 'success',
        data: {
          songs,
        },
      };
    }
    const songs = await this._songsService.getSongs();

    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;
    const song = await this._songsService.getSongById(id, request.payload);

    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;
    await this._songsService.editSongById(id, request.payload);

    return {
      status: 'success',
      message: 'Berhasil mengedit Lagu',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;
    await this._songsService.deleteSongById(id, request.payload);

    return {
      status: 'success',
      message: 'Berhasil menghapus Lagu',
    };
  }
}

module.exports = SongsHandler;
