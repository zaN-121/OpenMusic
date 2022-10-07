// dependencies
const autoBind = require('auto-bind');

class UsersHandler {
  constructor(usersService, validator) {
    this._usersService = usersService;
    this._validator = validator;

    autoBind(this);
  }

  async postUserHandler(request, h) {
    await this._validator.validateUsersPayload(request.payload);
    const { username, password, fullname } = request.payload;

    await this._usersService.verifyNewUsername(username);
    const result = await this._usersService.addUser(username, password, fullname);

    const response = h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId: result,
      },
    });
    response.code(201);
    return response;
  }

  async getUsersHandler(request, h) {
    const result = await this._usersService.getUsers();

    const response = h.response({
      status: 'success',
      data: {
        users: result,
      },
    });
    response.code(200);
    return response;
  }

  async getUserByIdHandler(request, h) {
    const { id } = request.params;

    const result = await this._usersService.getUserById(id);

    const response = h.response({
      status: 'success',
      data: {
        user: result,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = UsersHandler;
