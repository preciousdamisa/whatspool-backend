const config = require('config');

const axios = require('axios');

const url = 'https://api.flutterwave.com/v3/transactions/123456/verify';

async function verifyTransfer(data) {
  const res = await axios.default.get(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer FLWSECK_TEST-b3c7c8de99decea88a66e17e1f8da899-X`,
    },
  });

  if (
    res.data.data.status === 'successful' &&
    res.data.data['tx_ref'] === data.txref
  ) {
    if (res.data.data.amount >= data.amount) {
      return {
        status: 'successful',
        code: 0,
        chargeAmount: res.data.data.amount,
      };
    } else {
      return {
        status: 'not successful',
        code: 1,
        chargeAmount: res.data.data.amount,
      };
    }
  }
}

module.exports = verifyTransfer;
