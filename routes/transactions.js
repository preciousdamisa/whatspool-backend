const router = require('express').Router();

const { Transaction } = require('../models/transaction');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const transactions = await Transaction.find({
    'receiver.user': req.user._id,
  });

  res.send(transactions);
});

module.exports = router;
