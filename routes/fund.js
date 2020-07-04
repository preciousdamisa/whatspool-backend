const router = require('express').Router();
const { nanoid } = require('nanoid');
const config = require('config');
const mongoose = require('mongoose');

const { User, getReferrer } = require('../models/user');
const { Transfer } = require('../models/transfer');
const { Transaction } = require('../models/transaction');

router.get('/:fundInfo', async (req, res) => {
  const status = req.query.status;
  console.log('TRANSACTION STATUS:', status);
  const fundInfo = req.params.fundInfo.split('-');

  const userId = fundInfo[0];
  const amount = fundInfo[1];

  const session = await mongoose.startSession();
  session.startTransaction();
  const opts = { session };

  if (status === 'successful') {
    try {
      const user = await User.findById(userId);

      // referrer is the user who referred this user.
      const referrer = await getReferrer(user);

      if (referrer) {
        const referralBonus = 25;

        // TODO: Sender should be WhatsPool, with WhatsPool info (phone, user).

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
        mode: 'Flutterwave',
        msg: 'Funding successful.',
      });

      await transfer.save(opts);

      await session.commitTransaction();
      session.endSession();

      res.render('success', {
        transferId: transfer._id,
        desc: transfer.desc,
        amount,
      });
    } catch (ex) {
      console.log(ex);

      await session.abortTransaction();
      session.endSession();
      res.status(500).send('Error in funding wallet via e-gateway.');
    }
  } else {
    res.render('failure');
  }
});

module.exports = router;
