const router = require('express').Router();
const shortid = require('shortid');

const { User } = require('../models/user');
const { Participant, validate } = require('../models/participant');
const AccessPin = require('../models/accessPin');

router.get('/:walletId', async (req, res) => {
  const walletId = req.params.walletId;

  const participant = await Participant.findOne({ walletId });
  if (!participant)
    return res.status(404).send('No participant with the given Wallet ID.');

  res.send(participant);
});

router.post('/', async (req, res) => {
  let { error } = validate(req.body);
  if (error) return res.status(422).send(error.details[0].message);

  const user = await User.findOne({ phone: req.body.phone });

  // Check if there is enough in ref bonus.
  // Check if there is enough in normal balance.
  // check if there is enough in both balances.

  const amount = req.body.amount;

  const session = await mongoose.startSession();
  session.startTransaction();
  const opts = { session };

  try {
    if (user.referralBonus >= 100) {
      await user.updateOne(
        { _id: user._id },
        { $inc: { referralBonus: -amount } },
        opts
      );
    } else if (user.balance >= 100) {
      // Add ref bonus to normal balance.
      await user.updateOne(
        { _id: user._id },
        { $inc: { balance: -amount } },
        opts
      );

      const remainingBalance = user.balance + user.referralBonus - amount;

      user.updateOne(
        { _id: user._id },
        { $set: { balance: remainingBalance } },
        opts
      );
    } else if (user.balance + user.referralBonus >= 100) {
      // Add ref bonus to normal b
      whereToCharge = 'bothBalances';
    }

    // Create a payment transaction.

    const participantAccessPin = shortid();

    let participant = new Participant({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      walletId: req.body.walletId,
      accessPin: participantAccessPin,
    });

    const accessPin = new AccessPin({
      accessPin: participantAccessPin,
    });

    await accessPin.save();

    participant = await participant.save();
  } catch (ex) {}
  res.send(participant);
});

module.exports = router;
