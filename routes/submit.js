const router = require('express').Router();
const Joi = require('@hapi/joi');
const mongoose = require('mongoose');

const { Participant } = require('../models/participant');
const { Question } = require('../models/question');
const { Winner } = require('../models/winner');

router.post('/', async (req, res) => {
  const { error } = validateSubmitData(req.body);
  if (error) {
    return res.status(422).send(error.details[0].message);
  }

  const participant = await Participant.findById(req.body.participantId);
  if (!participant) {
    return res.status(404).send('No participant with the given ID.');
  }

  const question = await Question.findOne({ no: req.body.questionNumber });
  if (!question) {
    return res.status(404).send('Question not found.');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const opts = { session };

  try {
    if (!participant.finished) {
      if (req.body.questionNumber === 10) {
        if (req.body.ans === question.ans) {
          await Participant.updateOne(
            { _id: req.body.participantId },
            { $inc: { score: 1 } },
            opts
          );

          await Participant.updateOne(
            { _id: req.body.participantId },
            { $set: { metadata: { answeredAll: true } } },
            opts
          );

          await Participant.updateOne(
            { _id: req.body.participantId },
            { $inc: { currentQuestionNumber: 1 } },
            opts
          );

          if (participant.score === 9) {
            const winner = new Winner({
              firstName: participant.firstName,
              lastName: participant.lastName,
              email: participant.email,
              user: participant.user,
              phone: participant.phone,
              score: participant.score + 1,
              finished: true,
              metadata: { answeredAll: true },
            });

            await winner.save(opts);
          }

          res.send({
            msg: 'Answer submitted. Correct answer. All questions answered.',
            status: 1,
          });
        } else {
          await Participant.updateOne(
            { _id: req.body.participantId },
            { $set: { metadata: { answeredAll: true } } },
            opts
          );

          await Participant.updateOne(
            { _id: req.body.participantId },
            { $inc: { currentQuestionNumber: 1 } },
            opts
          );

          res.send({
            msg: 'Answer submitted. Wrong answer. All questions answered.',
            status: 1,
          });
        }

        // User has finshed: answered all qustions.
        await Participant.updateOne(
          { _id: req.body.participantId },
          { $set: { finished: true } },
          opts
        );
      } else {
        if (req.body.ans === question.ans) {
          await Participant.updateOne(
            { _id: req.body.participantId },
            { $inc: { score: 1 } },
            opts
          );

          await Participant.updateOne(
            { _id: req.body.participantId },
            { $inc: { currentQuestionNumber: 1 } },
            opts
          );

          res.send('Answer submitted. Correct answer.');
        } else {
          await Participant.updateOne(
            { _id: req.body.participantId },
            { $inc: { currentQuestionNumber: 1 } },
            opts
          );

          res.send('Answer submitted. Wrong answer.');
        }
      }
    } else {
      res.status(400).send('Participant has finished quiz.');
    }

    await session.commitTransaction();
    session.endSession();
  } catch (ex) {
    console.log(ex);

    await session.abortTransaction();
    session.endSession();
    res.status(500).send('Submitting failed. Please try again.');
  }
});

function validateSubmitData(data) {
  const schema = Joi.object({
    participantId: Joi.objectId().required(),
    questionNumber: Joi.number().min(1).max(10).required(),
    ans: Joi.string().min(1).max(1).trim().required(),
  });

  return schema.validate(data);
}

module.exports = router;
