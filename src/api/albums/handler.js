// dependencies
const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(albumsService, songsService, userAlbumLikesService, validator) {
    this._albumsService = albumsService;
    this._songsService = songsService;
    this._userAlbumLikesService = userAlbumLikesService;
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
      message: 'Album berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  async postAlbumLikeHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { albumId } = request.params;

    await this._albumsService.verifyIsAlbumExist(albumId);
    const didLiked = await this._albumsService.verifyDidUserLikedAlbum(albumId, credentialId);

    let message = '';

    if (!didLiked) {
      await this._userAlbumLikesService.addLike(albumId, credentialId);
      message = 'Berhasil menyukai album';
    } else {
      await this._userAlbumLikesService.unlike(albumId, credentialId);
      message = 'Batal menyukai album';
    }

    return h.response({
      status: 'success',
      message,
    }).code(201);
  }

  async getAlbumLikesHandler(request, h) {
    const { albumId } = request.params;

    await this._albumsService.verifyIsAlbumExist(albumId);
    const likeCount = await this._userAlbumLikesService.getAlbumLikes(albumId);

    if (typeof (likeCount) === 'number') {
      return {
        status: 'success',
        data: {
          likes: likeCount,
        },
      };
    }

    return h.response({
      status: 'success',
      data: {
        likes: Number(likeCount),
      },
    }).header('X-Data-Source', 'cache');
  }
}

module.exports = AlbumsHandler;
