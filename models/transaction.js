const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const config = require('config');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    amount: {
      type: Number,
      min: 25,
      max: 10000,
      required: true,
    },
    purpose: {
      type: String,
      minlength: 2,
      maxlength: 25,
      trim: true,
      required: true,
    },
    transactionId: {
      type: String,
      trim: true,
      required: true,
    },
    sender: new Schema({
      name: {
        type: String,
        minlength: 5,
        maxlength: 250,
        trim: true,
        required: true,
      },
      phone: {
        type: String,
        minlength: 11,
        maxlength: 11,
        trim: true,
        required: true,
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    }),
    receiver: new Schema({
      name: {
        type: String,
        minlength: 5,
        maxlength: 250,
        trim: true,
        required: true,
      },
      phone: {
        type: String,
        minlength: 11,
        maxlength: 11,
        trim: true,
        required: true,
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    }),
    msg: {
      type: String,
      minlength: 5,
      maxlength: 250,
      trim: true,
      required: true,
    },
    metadata: {},
  },
  { timestamps: true }
);

// TODO: REDUCE TOKEN EXPIRY TIME TO 30 SECONDS.
transactionSchema.statics.genTransactionToken = (
  sender,
  receiver,
  amount,
  purpose
) => {
  const token = jwt.sign(
    {
      sender: sender,
      receiver: receiver,
      amount: amount,
      purpose: purpose,
    },
    config.get('jwtTransactionPrivateKey'),
    { expiresIn: 30 }
  );

  return token;
};

const Transaction = mongoose.model('Transaction', transactionSchema);

function validateTransaction(data) {
  const schema = Joi.object({
    senderPhone: Joi.string()
      .min(11)
      .max(11)
      .required()
      .label("Sender's phone"),
    receiverPhone: Joi.string()
      .min(11)
      .max(11)
      .required()
      .label("Receiver's phone"),
    amount: Joi.number().min(50).max(10000).required().label('Amount'),
    purpose: Joi.string().min(2).max(25).required().label('Purpose'),
  });

  return schema.validate(data);
}

exports.Transaction = Transaction;
exports.valTransaction = validateTransaction;
