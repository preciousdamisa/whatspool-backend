const router = require('express').Router();

const { Transaction } = require('../models/transaction');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const userId = req.user._id;

  const transactions = await Transaction.find().or({
    'sender.user': userId,
    'receiver.user': userId,
  });

  res.send(transactions);
});

module.exports = router;
