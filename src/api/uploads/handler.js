const autoBind = require('auto-bind');

class UploadsHandler {
  constructor(
    storageService,
    albumsService,
    validator,
  ) {
    this._storageService = storageService;
    this._albumsService = albumsService;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumCoverImageHandler(request, h) {
    const { albumId } = request.params;
    const { cover } = request.payload;
    await this._validator.validateCoverImageHeader(cover.hapi.headers);
    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const url = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;
    await this._albumsService.addAlbumCoverImageUrl(albumId, url);

    return h.response({
      status: 'success',
      message: 'Cover album berhasil ditambahkan',
    }).code(201);
  }
}

module.exports = UploadsHandler;
