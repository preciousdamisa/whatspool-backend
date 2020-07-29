const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const Schema = mongoose.Schema;

const questionSchema = new Schema({
  que: {
    type: String,
    minlength: 5,
    maxlength: 1000,
    trim: true,
    required: true,
  },
  optA: {
    type: String,
    minlength: 1,
    maxlength: 250,
    trim: true,
    required: true,
  },
  optB: {
    type: String,
    minlength: 1,
    maxlength: 250,
    trim: true,
    required: true,
  },
  optC: {
    type: String,
    minlength: 1,
    maxlength: 250,
    trim: true,
    required: true,
  },
  optD: {
    type: String,
    minlength: 1,
    maxlength: 250,
    trim: true,
    required: true,
  },
  optE: {
    type: String,
    minlength: 1,
    maxlength: 250,
    trim: true,
    required: true,
  },
  ans: {
    type: String,
    minlength: 1,
    maxlength: 1,
    trim: true,
    required: true,
  },
  explanation: {
    type: String,
    minlength: 1,
    trim: true,
  },
  no: {
    type: Number,
    min: 1,
    max: 10,
    unique: true,
    required: true,
  },
  subj: {
    type: String,
    minlength: 1,
    max: 250,
    enum: ['Maths', 'English', 'General', 'Current Affairs'],
    trim: true,
    required: true,
  },
});

const Question = mongoose.model('Question', questionSchema);

function validateQuestion(data) {
  const schema = Joi.object({
    que: Joi.string().min(5).max(1000).trim().required(),
    optA: Joi.string().min(1).max(250).trim().required(),
    optB: Joi.string().min(1).max(250).trim().required(),
    optC: Joi.string().min(1).max(250).trim().required(),
    optD: Joi.string().min(1).max(250).trim().required(),
    optE: Joi.string().min(1).max(250).trim().required(),
    ans: Joi.string().min(1).max(1).trim().required(),
    explanation: Joi.string().min(1).trim(),
    no: Joi.number().min(1).max(10).required(),
    subj: Joi.string().min(1).max(250).trim().required(),
  });

  return schema.validate(data);
}

exports.Question = Question;
exports.validate = validateQuestion;
