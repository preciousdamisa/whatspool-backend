const router = require('express').Router();

const { User } = require('../models/user');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/:value', auth, admin, async (req, res) => {
  const value = req.params.value;
  
  const users = await User.find();

  const values = [];

  for (let user of users) {
    if (value === 'phone-numbers') {
      if (user.phone) {
        values.push(parseInt('234' + user.phone.slice(1)));
      }
    } else if (value === 'emails') {
      values.push(user.email);
    }
  }

  res.send({ count: values.length, values });
});

module.exports = router;
