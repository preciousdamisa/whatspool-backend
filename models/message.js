const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const { string } = require('@hapi/joi');

const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    name: {
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
    },
    phone: {
      type: String,
      minlength: 11,
      maxlength: 11,
      trim: true,
      required: true,
    },
    msg: {
      type: String,
      minlength: 5,
      maxlength: 5000,
      trim: true,
      required: true,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

function validate(data) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(250).trim().required(),
    email: Joi.string().min(5).max(250).trim().required(),
    phone: Joi.string().length(11).trim().required(),
    msg: Joi.string().min(5).max(5000).required(),
  });

  return schema.validate(data);
}

exports.Message = Message;
exports.validate = validate;
