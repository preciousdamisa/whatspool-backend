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

  let whereToCharge;

  if (user.referralBonus >= 100) {
    user.updateOne({ _id: user._id }, { $inc: { referralBonus: -amount } });
  } else if (user.balance >= 100) {
    // Add ref bonus to normal balance.
    whereToCharge = 'balance';
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
  res.send(participant);
});

module.exports = router;
