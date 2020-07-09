const router = require('express').Router();
const { nanoid } = require('nanoid');
const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const config = require('config');

const { User, getReferrer } = require('../models/user');
const { Transfer } = require('../models/transfer');
const { Transaction } = require('../models/transaction');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/', auth, admin, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(422).send(error.details[0].message);

  const session = await mongoose.startSession();
  session.startTransaction();
  const opts = { session };

  const phone = req.body.phone;
  const amount = req.body.amount;

  try {
    const user = await User.findOne({ phone });

    // referrer, is the user who referred the user
    // whose account is to be funded.
    const referrer = await getReferrer(user);

    if (referrer) {
      const referralBonus = 25;

      const transaction = new Transaction({
        sender: {
          name: 'WhatsPool',
          phone: config.get('whatspoolPhone'),
          user: config.get('whatspoolUser'),
        },
        receiver: {
          name: `${referrer.firstName} ${referrer.lastName}`,
          phone: referrer.phone,
          user: referrer._id,
        },
        amount: referralBonus,
        purpose: 'Referral bonus',
        transactionId: nanoid(),
        msg: 'Transaction successful',
      });

      await transaction.save(opts);

      await User.updateOne(
        { _id: user._id },
        { $inc: { balance: amount } },
        opts
      );

      await User.updateOne(
        { _id: referrer._id },
        { $inc: { referralBonus } },
        opts
      );

      await User.updateOne(
        { _id: user._id },
        { $set: { creditedReferrer: true } },
        opts
      );
    } else {
      await User.updateOne(
        { _id: user._id },
        { $inc: { balance: amount } },
        opts
      );
    }

    const transferId = nanoid();

    const transfer = new Transfer({
      user: user._id,
      amount,
      desc: 'In transfer',
      transferId,
      mode: 'Bank Transfer',
      msg: 'Funding successful.',
    });

    await transfer.save(opts);

    await session.commitTransaction();
    session.endSession();

    res.send(transfer);
  } catch (ex) {
    console.log(ex);

    await session.abortTransaction();
    session.endSession();
    res.status(500).send('Error in funding wallet manually.');
  }
});

function validate(data) {
  const schema = Joi.object({
    phone: Joi.string().trim().length(11).required(),
    amount: Joi.number().min(100).max(10000).required(),
  });

  return schema.validate(data);
}

module.exports = router;
