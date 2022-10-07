const UsersHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'users',
  version: '1.0.0',
  register: async (server, { usersService, validator }) => {
    const usersHandler = new UsersHandler(usersService, validator);
    server.route(routes(usersHandler));
  },
};
