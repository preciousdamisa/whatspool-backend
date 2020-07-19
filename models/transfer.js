const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const transferSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      min: 50,
      max: 1000000,
      required: true,
    },
    // charge: {
    //   type: Number,
    //   min: 3,
    //   max: 1000000,
    //   required: true
    // },
    desc: {
      type: String,
      minlength: 2,
      maxlength: 250,
      trim: true,
      required: true,
    },
    transferId: {
      type: String,
      trim: true,
      required: true,
    },
    mode: {
      type: String,
      enum: ["Flutterwave", 'Bank Transfer'],
      required: true,
    },
    msg: {
      type: String,
      trim: true,
      minlength: 5,
      maxlength: 250,
      required: true,
    },
    metadata: {},
  },
  { timestamps: true }
);

exports.Transfer = mongoose.model("Transfer", transferSchema);
