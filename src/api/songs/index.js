const SongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'songsapi',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const songHandler = new SongsHandler(service, validator);
    server.route(routes(songHandler));
  },
};
