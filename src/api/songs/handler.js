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

    const response = h.response({
      status: 'success',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler(request, h) {
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
  }

  async getSongByIdHandler(request, h) {
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
  }

  async putSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;
    await this._songsService.editSongById(id, request.payload);

    const response = h.response({
      status: 'success',
      message: 'Berhasil mengedit Lagu',
    });
    response.code(200);
    return response;
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;
    await this._songsService.deleteSongById(id, request.payload);
    const response = h.response({
      status: 'success',
      message: 'Berhasil menghapus Lagu',
    });
    response.code(200);
    return response;
  }
}

module.exports = SongsHandler;
