const router = require('express').Router();
const Joi = require('@hapi/joi');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const { User } = require('../models/user');

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(422).send(error.details[0].message);
  }

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send('Invalid email or password.');
  }

  const isPassword = await bcrypt.compare(req.body.password, user.password);
  if (!isPassword) {
    return res.status(400).send('Invalid email or password.');
  }

  const token = user.genToken();

  res
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

function validate(data) {
  const schema = Joi.object({
    email: Joi.string()
      .min(5)
      .max(250)
      .trim()
      .email({ minDomainSegments: 2 })
      .required(),
    password: Joi.string().min(5).max(250).trim().required(),
  });

  return schema.validate(data);
}

module.exports = router;
