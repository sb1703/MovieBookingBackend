const axios = require("../config/axios")
const checksum_lib = require("../routes/Paytm/checksum")
const config = require("../routes/Paytm/config")

const BASE_URL = "https://securegw-stage.paytm.in";

// const BASE_URL = "https://securegw.paytm.in";                            PRODUCTION URL

const paynow = async (req, res) => {
  const paymentDetails = {
    amount: req.body.amount,
    customerId: req.body.name.replace(/\s/g, ""),
    customerEmail: req.body.email,
    customerPhone: req.body.phone,
  }

  if (
    !paymentDetails.amount ||
    !paymentDetails.customerId ||
    !paymentDetails.customerEmail ||
    !paymentDetails.customerPhone
  ) {
    return res.status(400).json({ message: "Payment is failed" })
  }

  let params = {}
  params["MID"] = config.PaytmConfig.mid
  params["WEBSITE"] = config.PaytmConfig.website
  params["CHANNEL_ID"] = "WEB"
  params["INDUSTRY_TYPE_ID"] = "Retail"
  params["ORDER_ID"] = "TEST_" + new Date().getTime()
  params["CUST_ID"] = paymentDetails.customerId
  params["TXN_AMOUNT"] = paymentDetails.amount
  params["CALLBACK_URL"] = "http://localhost:3500/payment/callback"
  params["EMAIL"] = paymentDetails.customerEmail
  params["MOBILE_NO"] = paymentDetails.customerPhone

  let url = BASE_URL + '/theia/processTransaction';

  checksum_lib.genchecksum(params, config.PaytmConfig.key, (err, checksum) => {
    if (err) {
      return res.status(400).json({ message: "Payment is failed" })
    }

    let form_fields = ""
    for (x in params) {
      form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >"
    }
    form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >"

    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>')
    res.end()
  })
}

const callback = async (req, res) => {
    // log the callback response payload returned:
    let callbackResponse = req.body;
    console.log('Transaction response: ', callbackResponse)

    // verify callback response checksum:
    let checksumVerification = paytm_checksum.verifychecksum(callbackResponse, MERCHANT_KEY)
    console.log('checksum_verification_status: ', checksumVerification)

    // verify transaction status:
    let transactionVerifyPayload = {
        MID: callbackResponse.MID,
        ORDERID: callbackResponse.ORDERID,
        CHECKSUMHASH: callbackResponse.CHECKSUMHASH
    }
    let url = BASE_URL + '/order/status';
    Request.post({url: url, body: JSON.stringify(transactionVerifyPayload)}, (error, resp, body) => {
        let verificationResponse = JSON.parse(body);
        console.log('Verification response: ', verificationResponse);
        // store in db
    })
}

module.exports = {
  paynow,
  callback
}
