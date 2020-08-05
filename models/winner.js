const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const winnerSchema = new Schema(
  {
    firstName: {
      type: String,
      minlength: 2,
      maxlength: 250,
      trim: true,
      required: true,
    },
    lastName: {
      type: String,
      minlength: 2,
      maxlength: 250,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      minlength: 5,
      maxlength: 250,
      trim: true,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    phone: {
      type: String,
      minlength: 11,
      maxlength: 11,
      required: true,
      unique: true,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    finished: {
      type: Boolean,
      default: false,
    },
    answers: {},
    metadata: {},
  },
  { timestamps: true }
);

exports.Winner = mongoose.model('Winner', winnerSchema);
