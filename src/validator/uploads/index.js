// Error
const InvariantError = require('../../exceptions/InvariantError');

// schema
const CoverImageHeaderSchema = require('./schema');

const CoverImageValidator = {
  validateCoverImageHeader: (headers) => {
    const validationResult = CoverImageHeaderSchema.validate(headers);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CoverImageValidator;
