const config = require('config');

const http = require('./http');

const url =
  'https://ravesandboxapi.flutterwave.com/flwv3-pug/getpaidx/api/v2/verify';

async function verifyTransfer(data) {
  const res = await http.post(url, {
    SECKEY: 'FLWSECK-26b84e92406f072fb7c6527b758daea2-X',
    txref: data.txref,
  });

  if (
    res.data.data.status === 'successful' &&
    res.data.data.chargecode === '00'
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
