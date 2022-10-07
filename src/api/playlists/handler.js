// dependencies
const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(
    playlistsService,
    songsService,
    playlistSongsService,
    playlistsValidator,
    playlistSongsValidator,
    playlistSongActivitiesService,
  ) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._playlistSongsService = playlistSongsService;
    this._playlistValidator = playlistsValidator;
    this._playlistSongsValidator = playlistSongsValidator;
    this._playlistSongActivitesService = playlistSongActivitiesService;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    // validate payload
    this._playlistValidator.validatePlaylistPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;

    const { name } = request.payload;
    const result = await this._playlistsService.addPlaylist(name, credentialId);

    const response = h.response({
      status: 'success',
      data: {
        playlistId: result,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const result = await this._playlistsService.getPlaylists(credentialId);

    return {
      status: 'success',
      data: {
        playlists: result,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._playlistsService.deletePlaylistById(playlistId);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postPlaylistSongHandler(request, h) {
    this._playlistSongsValidator.validatePlaylistSongPayload(request.payload);
    const { songId } = request.payload;
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyIsPlaylistExist(playlistId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._songsService.verifyIsSongExist(songId);
    await this._playlistSongsService.verifyIsPlaylistSongExist(playlistId, songId);

    await this._playlistSongsService.addPlaylistSong(playlistId, songId);

    const action = request.method === 'post' ? 'add' : 'delete';

    await this._playlistSongActivitesService.addPlaylistSongActivitie(
      playlistId,
      songId,
      credentialId,
      action,
    );

    const response = h.response({
      status: 'success',
      message: `Lagu berhasil ditambahkan ke playlist ${playlistId}`,
    });
    response.code(201);
    return response;
  }

  async getPlaylistWithSongsByIdHandler(request) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyIsPlaylistExist(playlistId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const playlist = await this._playlistsService.getPlaylistById(playlistId);
    const songs = await this._songsService.getSongsInPlaylistByPlaylistId(playlistId);
    playlist.songs = songs;
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistSongHandler(request) {
    this._playlistSongsValidator.validatePlaylistSongPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;
    const { playlistId } = request.params;
    await this._playlistsService.verifyIsPlaylistExist(playlistId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    await this._playlistSongsService.deletePlaylistSong(playlistId, songId);
    const action = request.method === 'post' ? 'add' : 'delete';

    await this._playlistSongActivitesService.addPlaylistSongActivitie(
      playlistId,
      songId,
      credentialId,
      action,
    );

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }

  async getPlaylistSongActivitiesByPlaylistIdHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;
    await this._playlistsService.verifyIsPlaylistExist(playlistId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const {
      activities,
    } = await this._playlistsService.getPlaylistActivitiesById(playlistId);

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
