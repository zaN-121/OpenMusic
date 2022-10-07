// dependencies
const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(albumsService, songsService, validator) {
    this._albumsService = albumsService;
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const albumId = await this._albumsService.addAlbum(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;

    const album = await this._albumsService.getAlbumById(id);
    const songs = await this._songsService.getSongsByAlbumId(id);
    album.songs = songs;

    const response = h.response({
      status: 'success',
      data: {
        album,
      },
    });
    response.code(200);
    return response;
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    const albumId = await this._albumsService.editAlbumById(id, request.payload);

    const response = h.response({
      status: 'success',
      message: 'Berhasil memperbarui album',
      data: {
        albumId,
      },
    });
    response.code(200);
    return response;
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;
    await this._albumsService.deleteAlbumById(id);

    const response = h.response({
      status: 'success',
      message: 'Catatan berhasil dihapus',
    });
    response.code(200);
    return response;
  }
}

module.exports = AlbumsHandler;
