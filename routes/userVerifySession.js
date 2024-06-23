const express = require('express')
const router = express.Router()
const userVerifySession = require('../controllers/userVerifySessionController')

router.get('/', userVerifySession.handleVerifySession)

module.exports = router