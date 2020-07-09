const router = require('express').Router();
const Joi = require('@hapi/joi');
const _ = require('lodash');

const { Question, validate } = require('../models/question');
const moderator = require('../middleware/moderator');
const auth = require('../middleware/auth');

router.post('/', auth, moderator, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(422).send(error.details[0].message);
  }

  const count = await Question.find().count();

  if (count === 10) {
    return res.status(400).send('Maximum number of questions (10) reached.');
  }

  let question = Question({
    que: req.body.que,
    optA: req.body.optA,
    optB: req.body.optB,
    optC: req.body.optC,
    optD: req.body.optD,
    optE: req.body.optE,
    ans: req.body.ans,
    no: req.body.no,
    subj: req.body.subj,
  });

  question = await question.save();

  res.status(201).send(question);
});

router.get('/:questionNumber', async (req, res) => {
  const questionNumber = parseInt(req.params.questionNumber);

  const { error } = validateQuestionNumber({ questionNumber });
  if (error) {
    return res.status(422).send(error.details[0].message);
  }

  const question = await Question.findOne({ no: questionNumber });

  if (!question) {
    return res.status(404).send('Question not found.');
  }

  return res.send(
    _.pick(question, ['que', 'optA', 'optB', 'optC', 'optD', 'optE', 'no'])
  );
});

router.delete('/', auth, moderator, async (req, res) => {
  const result = await Question.remove({});

  res.send({ result, msg: 'Questions deleted succesfully' });
});

function validateQuestionNumber(data) {
  const schema = Joi.object({
    questionNumber: Joi.number().min(1).max(10).required(),
  });

  return schema.validate(data);
}

module.exports = router;
