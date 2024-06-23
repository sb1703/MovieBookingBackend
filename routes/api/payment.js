const express = require('express')
const router = express.Router()
const paymentController = require('../../controllers/paymentController')

router.route('/paynow')
    .post(paymentController.paynow)

router.route('/callback')
    .post(paymentController.callback)

module.exports = router