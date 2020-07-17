const router = require('express').Router();
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const shortid = require('shortid');

const { User, validate } = require('../models/user');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Gets a user with the given ID.
// Requires authentication.
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select(
    '-password -__v -updatedAt'
  );

  res.send(user);
});

// Gets the total number of users.
// Requires authentication and an admin status.
router.get('/count', auth, admin, async (req, res) => {
  const count = await User.find().count();

  res.send({ count });
});

// Gets the user with the specfied phone number.
// Requires authentication and an admin status.
router.get('/:phone', auth, admin, async (req, res) => {
  const user = await User.findOne({ phone: req.params.phone }).select(
    '-password -__v -updatedAt'
  );

  if (!user) return res.status(404).send("User isn't registered yet.");

  res.send(user);
});

// Creates a user.
router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(422).send(error.details[0].message);
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).send('User already registered.');
  }

  user = new User(
    _.pick(req.body, ['firstName', 'lastName', 'email', 'phone'])
  );

  const hashed = await bcrypt.hash(req.body.password, 12);

  user.password = hashed;

  user.balance = 50;

  user.referralBonus = 0;

  // The referral code of the user who referred this user.
  let referrer;

  if (req.body.referrer) {
    const fetchedUser = await User.findOne({
      referralCode: req.body.referrer,
    });

    if (fetchedUser) {
      referrer = fetchedUser.referralCode;
    } else {
      return res.status(400).send('No user with the given referral code.');
    }
  }

  user.referrer = referrer;

  user.referralCode = shortid();

  if (referrer) {
    user.creditedReferrer = false;
  }

  await user.save();

  const token = user.genToken();

  res
    .status(201)
    .header('x-auth-token', token)
    .header('access-control-expose-headers', 'x-auth-token')
    .send(
      _.pick(user, [
        '_id',
        'firstName',
        'lastName',
        'email',
        'phone',
        'referralCode',
      ])
    );
});

// Adds a role for a user.
// Requires authentication and a super admin status.
router.post('/roles', auth, async (req, res) => {
  const isSuperAdmin = req.user.roles.find((r) => r === 'Super Admin');

  if (isSuperAdmin) {
    const phone = req.body.phone;

    try {
      const user = await User.findOne({ phone });

      if (!user) return res.status(404).send("User isn't registered!");

      const validRoles = ['Admin', 'Moderator'];

      // Check if specified role exists.
      const result = validRoles.find((r) => r === req.body.role);
      if (!result) return res.status(400).send('Invalid role.');

      // Check if the user has the role already.
      const role = user.roles.find((r) => r === req.body.role);

      if (role) {
        return res.status(400).send(`User has that role already.`);
      } else {
        user.roles.push(req.body.role);
      }

      user.save();

      res.send(_.pick(user, ['_id', 'firstName', 'lastName', 'roles']));
    } catch (ex) {
      console.log(ex);

      res.status(500).send('Something failed Please try again.');
    }
  } else {
    res.status(403).send("Can't add role. User is not a super admin.");
  }
});

module.exports = router;
