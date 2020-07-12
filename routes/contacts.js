const router = require('express').Router();

const { User } = require('../models/user');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/:value', auth, admin, async (req, res) => {
  const users = await User.find();

  const values = [];

  const value = req.params.value;
  for (let user of users) {
    if (value === 'phone-numbers') {
      if (user.phone) {
        values.push(parseInt(user.phone));
      }
    } else if (value === 'emails') {
      values.push(user.email);
    }
  }

  res.send({ count: values.length, values });
});

module.exports = router;
