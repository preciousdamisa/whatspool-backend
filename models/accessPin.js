const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const accessPinSchema = new Schema(
  {
    accessPin: {
      type: String,
      minlength: 1,
      maxlength: 250,
      trim: true,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Access-Pins', accessPinSchema);
