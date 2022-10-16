// Error
const InvariantError = require('../../exceptions/InvariantError');

// schema
const ExportsPayloadSchema = require('./schema');

const ExportsValidator = {
  validateExportPayload: (payload) => {
    const validationResult = ExportsPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ExportsValidator;
