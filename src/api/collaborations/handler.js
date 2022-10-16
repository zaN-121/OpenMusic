// dependencies
const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(
    collaborationsService,
    playlistsService,
    usersService,
    validator,
  ) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._usersService = usersService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    await this._validator.validateCollaborationPayload(request.payload);
    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    // is playlist exist?
    await this._playlistsService.verifyIsPlaylistExist(playlistId);
    // is request owner playlist owner?
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    // is user exixt?
    await this._usersService.verifyIsUserExist(userId);
    // is collaborations is exist?
    await this._collaborationsService.verifyIsCollaborationExist(playlistId, userId);

    const result = await this._collaborationsService.addCollaboration(playlistId, userId);

    return h.response({
      status: 'success',
      data: {
        collaborationId: result,
      },
    }).code(201);
  }

  async deleteCollaborationByIdHandler(request) {
    await this._validator.validateCollaborationPayload(request.payload);
    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    // is playlist exist?
    await this._playlistsService.verifyIsPlaylistExist(playlistId);
    // is playlist owner?
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    // is collaborations exist?

    await this._collaborationsService.deleteCollaboration(playlistId, userId);

    return {
      status: 'success',
      message: 'Collaboration berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;
