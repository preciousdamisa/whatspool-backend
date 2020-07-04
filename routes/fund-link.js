const http = require('axios');
const router = require('express').Router();
const Joi = require('@hapi/joi');
const config = require('config');

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(422).send(error.details[0].message);

  try {
    const response = await http.post(
      'https://api.flutterwave.com/v3/payments',
      {
        tx_ref: req.body.txRef,
        amount: req.body.amount,
        currency: 'NGN',
        redirect_url: `https://whatspool-backend.herokuapp.com/api/fund/${req.body.userId}-${req.body.amount}`,
        payment_options: 'card',
        customer: {
          email: req.body.email,
          phonenumber: req.body.phone,
          name: req.body.name,
        },
        customizations: {
          title: 'WhatsPool',
          description: 'Fund your WhatsPool account.',
          logo:
            'https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,w_956,h_537/v1569012383/assets/f9/2a4534-291c-4c99-9886-d5654fcb8b45/original/Pool.png',
        },
      },
      {
        headers: {
          Authorization: `Bearer FLWSECK_TEST-b3c7c8de99decea88a66e17e1f8da899-X`,
        },
      }
    );

    if (response.data.status === 'success') {
      res.send(response.data);
    } else {
      res.status(500).send('Something failed, please try again.');
    }
  } catch (ex) {
    console.log(ex);

    res.status(500).send('Something failed, please try again.');
  }
});

function validate(data) {
  const schema = Joi.object({
    txRef: Joi.string().min(1).trim().required(),
    amount: Joi.string().min(1).trim().required(),
    email: Joi.string()
      .min(5)
      .email({ minDomainSegments: 2 })
      .trim()
      .required(),
    phone: Joi.string().length(11).trim().required(),
    name: Joi.string().min(2).trim().required(),
    userId: Joi.string().min(1).trim().required(),
  });

  return schema.validate(data);
}

module.exports = router;
