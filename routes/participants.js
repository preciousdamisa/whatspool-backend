const router = require('express').Router();
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const config = require('config');

const { User } = require('../models/user');
const { Participant, validate } = require('../models/participant');
const { Transaction } = require('../models/transaction');
const auth = require('../middleware/auth');
const moderator = require('../middleware/moderator');
const adminOrModerator = require('../middleware/admin-or-moderator');

// Gets the total number of participants.
router.get('/count', auth, adminOrModerator, async (req, res) => {
  const count = await Participant.find().count();

  res.send({ count });
});

// Gets the participant with the given phone number.
router.get('/:phone', async (req, res) => {
  const participant = await Participant.findOne({ phone: req.params.phone });

  if (!participant)
    return res.status(404).send('No participant with the given phone number.');

  res.send(participant);
});

router.post('/', async (req, res) => {
  let { error } = validate(req.body);
  if (error) return res.status(422).send(error.details[0].message);

  const user = await User.findById(req.body.userId);

  const amount = req.body.amount;

  const session = await mongoose.startSession();
  session.startTransaction();
  const opts = { session };

  try {
    if (user.referralBonus >= 100) {
      await User.updateOne(
        { _id: user._id },
        { $inc: { referralBonus: -amount } },
        opts
      );
    } else if (user.balance >= 100) {
      await User.updateOne(
        { _id: user._id },
        { $inc: { balance: -amount } },
        opts
      );

      const currentBalance = user.balance - amount;

      const remainingBalance = currentBalance + user.referralBonus;

      await User.updateOne(
        { _id: user._id },
        { $set: { balance: remainingBalance } },
        opts
      );

      if (user.referralBonus > 0) {
        await User.updateOne(
          { _id: user._id },
          { $set: { referralBonus: 0 } },
          opts
        );
      }
    } else if (user.balance + user.referralBonus >= 100) {
      const remainingBalance = user.balance + user.referralBonus - amount;

      await User.updateOne(
        { _id: user._id },
        { $set: { balance: remainingBalance } },
        opts
      );
    } else {
      return res.status(400).send('Insufficient balance.');
    }

    const transaction = new Transaction({
      sender: {
        name: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        user: user._id,
      },
      receiver: {
        name: `WhatsPool`,
        phone: config.get('whatspoolPhone'),
        user: config.get('whatspoolUser'),
      },
      amount,
      purpose: 'WhatsPool Registration',
      transactionId: nanoid(),
      msg: 'Transaction successful',
    });

    await transaction.save(opts);

    let participant = new Participant({
      user: req.body.userId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
    });

    participant = await participant.save(opts);

    await session.commitTransaction();
    session.endSession();

    res.send(participant);
  } catch (ex) {
    console.log(ex);

    await session.abortTransaction();
    session.endSession();
    res.status(500).send('Something failed. Please try again');
  }
});

router.delete('/', auth, moderator, async (req, res) => {
  const result = await Participant.remove({});

  res.send({ result, msg: 'Participants deleted successfully' });
});

module.exports = router;
