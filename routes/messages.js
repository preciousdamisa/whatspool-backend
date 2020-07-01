const router = require('express').Router();

const { Message, validate } = require('../models/message');

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(422).send(error.details[0].message);

  const message = new Message({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    msg: req.body.msg,
  });

  await message.save();

  res.status(201).send('Message sent successfully');
});

module.exports = router;
