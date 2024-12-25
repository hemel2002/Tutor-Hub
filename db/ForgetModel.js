const mongoose = require('mongoose');
const tokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, 'Token is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
    },

    expiryTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

const TokenModel = mongoose.model('Token', tokenSchema);
module.exports = TokenModel;
