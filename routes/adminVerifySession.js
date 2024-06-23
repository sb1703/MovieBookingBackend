const express = require('express')
const router = express.Router()
const adminVerifySession = require('../controllers/adminVerifySessionController')

router.get('/', adminVerifySession.handleVerifySession)

module.exports = router