// Error
const InvariantError = require('../../exceptions/InvariantError');

// Schema
const UsersPayloadSchema = require('./schema');

const UsersValidator = {
  validateUsersPayload: (payload) => {
    const validationResult = UsersPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UsersValidator;
