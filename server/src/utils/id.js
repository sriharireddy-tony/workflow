const mongoose = require('mongoose');
const ApiError = require('./ApiError');

function assertObjectId(id, label = 'id') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
}

module.exports = { assertObjectId };
