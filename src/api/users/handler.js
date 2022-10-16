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

    return h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId: result,
      },
    }).code(201);
  }

  async getUsersHandler() {
    const result = await this._usersService.getUsers();

    return {
      status: 'success',
      data: {
        users: result,
      },
    };
  }

  async getUserByIdHandler(request) {
    const { id } = request.params;

    const result = await this._usersService.getUserById(id);

    return {
      status: 'success',
      data: {
        user: result,
      },
    };
  }
}

module.exports = UsersHandler;
