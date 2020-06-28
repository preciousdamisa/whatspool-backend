const router = require('express').Router();
const shortid = require('shortid');
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const { User } = require('../models/user');
const { Participant, validate } = require('../models/participant');
const AccessPin = require('../models/accessPin');
const { Transaction } = require('../models/transaction');

router.get('/:phone', async (req, res) => {
  const phone = req.params.phone;

  const participant = await Participant.findOne({ phone });
  if (!participant) return res.status(404).send("User isn't registered yet.");

  res.send(participant);
});

router.post('/', async (req, res) => {
  let { error } = validate(req.body);
  if (error) return res.status(422).send(error.details[0].message);

  const user = await User.findOne({ phone: req.body.phone });

  const amount = req.body.amount;

  // const session = await mongoose.startSession();
  // session.startTransaction();
  // const opts = { session };

  try {
    if (user.referralBonus >= 100) {
      await User.updateOne(
        { _id: user._id },
        { $inc: { referralBonus: -amount } }
      );
    } else if (user.balance >= 100) {
      await User.updateOne({ _id: user._id }, { $inc: { balance: -amount } });

      const remainingBalance = user.balance + user.referralBonus - amount;

      await User.updateOne(
        { _id: user._id },
        { $set: { balance: remainingBalance } }
      );
    } else if (user.balance + user.referralBonus >= 100) {
      await User.updateOne(
        { _id: user._id },
        { $inc: { referralBonus: -user.referralBonus } }
      );

      const remainingBalance = user.balance + user.referralBonus - amount;

      await User.updateOne(
        { _id: user._id },
        { $set: { balance: remainingBalance } }
      );
    } else {
      return res.status(400).send('Insufficient balance.');
    }

    const transaction = new Transaction({
      sender: {
        name: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        user: user._id, // config.get('whatspoolUser')
      },
      receiver: {
        name: `WhatsPool`,
        phone: '09066581852',
        user: user._id,
      },
      amount,
      purpose: 'WhatsPool Registration',
      transactionId: nanoid(),
      msg: 'Transaction successful',
    });

    await transaction.save();

    const participantAccessPin = shortid();

    let participant = new Participant({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      accessPin: participantAccessPin,
    });

    const accessPin = new AccessPin({
      accessPin: participantAccessPin,
    });

    await accessPin.save();

    participant = await participant.save();

    res.send(participant);
  } catch (ex) {
    console.log(ex);
    res.status(500).send('Something failed. Please try again');
  }
});

module.exports = router;
