const router = require('express').Router();
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const config = require('config');

const { User, getReferrer } = require('../models/user');
const { Transfer } = require('../models/transfer');
const { Transaction } = require('../models/transaction');
const verifyTransfer = require('../services/verify-transfer');

router.post('/:fundInfo', async (req, res) => {
  const txref = req.query.txref;
  const fundInfo = req.params.fundInfo.split('-');

  const userId = fundInfo[0];
  const amount = fundInfo[1];

  const data = { txref, amount };
  const { status, code, chargeAmount } = await verifyTransfer(data);

  if (status === 'successful' && code === 0 && chargeAmount >= amount) {
    const session = await mongoose.startSession();
    session.startTransaction();
    const opts = { session };

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
            user: user._id, // config.get('whatspoolUser')
          },
          receiver: {
            name: `${user.firstName} ${user.lastName}`,
            phone: user.phone,
            user: user._id,
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
  }
});

module.exports = router;
