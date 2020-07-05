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
            'https://scontent.flos2-1.fna.fbcdn.net/v/t1.0-9/106808765_103442878104292_6550632615149142462_o.png?_nc_cat=110&_nc_sid=09cbfe&_nc_eui2=AeHBh33ePVVASi4p_Lm1qESOUxWg6UxCty5TFaDpTEK3Lvpkj6mIuky5TtaEo419hk49TTxIoecYO8qqPIPqO09q&_nc_oc=AQkXA7CXTNUshhgxgI81dzWdh7mFUbIJOfeWksOcDqBf8pr_oepvH3YZd9PxP5it7-M&_nc_ht=scontent.flos2-1.fna&oh=ca881e8b47d5782820472544d01a77c6&oe=5F27D990',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${config.get('flutterwaveSecretKey')}`,
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
