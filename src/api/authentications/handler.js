// dependencies
const autoBind = require('auto-bind');

class AuthenticationsHandler {
  constructor(
    authenticationsService,
    usersService,
    tokenManager,
    validator,
  ) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    autoBind(this);
  }

  async postAuthenticationHandler(request, h) {
    // validate post payload
    this._validator.validatePostAuthenticationPayload(request.payload);
    // verify user credential
    const { username, password } = request.payload;
    const id = await this._usersService.verifyUserCredentials(username, password);
    // generate access & refresh token
    const accessToken = this._tokenManager.generateAccessToken({ id });
    const refreshToken = this._tokenManager.generateRefreshToken({ id });
    await this._authenticationsService.addRefreshToken(refreshToken);

    return h.response({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    }).code(201);
  }

  async putAuthenticationHandler(request) {
    // validate put payload
    this._validator.validatePutAuthenticationPayload(request.payload);
    // verify refresh token
    const { refreshToken } = request.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    const { id } = this._tokenManager.verifyRefreshToken(refreshToken);
    // generate accessToken token
    const accessToken = this._tokenManager.generateAccessToken({ id });

    return {
      status: 'success',
      data: {
        accessToken,
      },
    };
  }

  async deleteAuthenticationHandler(request) {
    // validate delete payload
    this._validator.validateDeleteAuthenticationPayload(request.payload);
    // verify refresh token
    const { refreshToken } = request.payload;
    this._tokenManager.verifyRefreshToken(refreshToken);
    // delete refresh token
    await this._authenticationsService.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}
module.exports = AuthenticationsHandler;
