const router = require('express').Router();
const fs = require('fs');

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
      fs.appendFile('emails.txt', `${user.email}\n`, () => {});
    }
  }

  res.send({ count: values.length, values });
});

module.exports = router;
