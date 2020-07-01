const router = require('express').Router();

const { Transfer } = require('../models/transfer');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const transfers = await Transfer.find({
    user: req.user._id,
  });

  res.send(transfers);
});

module.exports = router;
