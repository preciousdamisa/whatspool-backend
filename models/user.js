const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const config = require('config');

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      minlength: 2,
      maxlength: 50,
      trim: true,
      required: true,
    },
    lastName: {
      type: String,
      minlength: 2,
      maxlength: 50,
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
    password: {
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
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      min: 0,
      max: 10000,
      required: true,
    },
    referralBonus: {
      type: Number,
      min: 0,
      max: 10000,
    },
    referralCode: {
      type: String,
      minlength: 1,
      maxlength: 250,
      trim: true,
      unique: true,
      required: true,
    },
    referrer: {
      type: String,
      minlength: 1,
      maxlength: 250,
      trim: true,
    },
    creditedReferrer: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

userSchema.methods.genToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
    },
    config.get('jwtAuthPrivateKey'),
    { expiresIn: 3600 }
  );

  return token;
};

const User = mongoose.model('User', userSchema);

function validate(data) {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(25).trim().required(),
    lastName: Joi.string().min(2).max(25).trim().required(),
    email: Joi.string()
      .min(5)
      .max(250)
      .trim()
      .email({ minDomainSegments: 2 })
      .required(),
    password: Joi.string().min(5).max(250).trim().required(),
    phone: Joi.string().min(11).max(11).required(),
    referrer: Joi.string().min(1).max(250).trim(),
  });

  return schema.validate(data);
}

async function getReferrer(user) {
  if (user.referrer) {
    if (!user.creditedReferrer) {
      const fetchedUser = await User.findOne({
        referralCode: user.referrer,
      });
      return fetchedUser;
    }
  }
}

exports.User = User;
exports.validate = validate;
exports.getReferrer = getReferrer;
