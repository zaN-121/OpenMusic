const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(
    producerService,
    playlistService,
    validator,
  ) {
    this._producerService = producerService;
    this._playlistsService = playlistService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistByIdHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyIsPlaylistExist(playlistId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._validator.validateExportPayload(request.payload);

    const { targetEmail } = request.payload;

    const message = {
      playlistId,
      targetEmail,
    };
    await this._producerService.sendMessage('export:playlist', JSON.stringify(message));

    return h.response({
      status: 'success',
      message: 'Permintaan anda sedang kami proses',
    }).code(201);
  }
}

module.exports = ExportsHandler;
