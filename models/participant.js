const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const Schema = mongoose.Schema;

const participantSchema = new Schema(
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
    phone: {
      type: String,
      minlength: 11,
      maxlength: 11,
      required: true,
      unique: true,
    },
    accessPin: {
      type: String,
      minlength: 1,
      maxlength: 250,
      unique: true,
      trim: true,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    currentQuestionNumber: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    finished: {
      type: Boolean,
      default: false
    },
    answers: {},
    metadata: {},
  },
  { timestamps: true }
);

const Participant = mongoose.model("Participant", participantSchema);

function validateParticipant(data) {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(250).trim().required(),
    lastName: Joi.string().min(2).max(250).trim().required(),
    email: Joi.string()
      .min(5)
      .max(250)
      .trim()
      .email({ minDomainSegments: 2 })
      .required(),
    phone: Joi.string().min(11).max(11).required(),
    amount: Joi.number().min(100).max(100).required(),
    purpose: Joi.string().min(2).max(250).trim().required(),
  });

  return schema.validate(data);
}

exports.Participant = Participant;
exports.validate = validateParticipant;
