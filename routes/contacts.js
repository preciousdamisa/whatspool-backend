const router = require('express').Router();

const { User } = require('../models/user');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/phone-numbers', auth, admin, async (req, res) => {
  const users = await User.find();

  const phones = [];

  for (let user of users) {
    phones.push(parseInt(user.phone));
  }

  res.send({ count: phones.length, phones });
});

module.exports = router;
