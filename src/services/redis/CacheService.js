const redis = require('redis');
const { redis: redisConfig } = require('../../utils/config');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: redisConfig.server,
      },
    });

    this._client.on('error', (error) => {
      process.stdout.write(error);
    });

    this._client.connect();
  }

  async set(key, value, expirationInSecond = 3600) {
    await this._client.set(key, value, {
      EX: expirationInSecond,
    });
  }

  async get(key) {
    const result = await this._client.get(key);

    return result;
  }

  async delete(key) {
    await this._client.del(key);
  }
}

module.exports = CacheService;
