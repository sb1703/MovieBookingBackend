const express = require('express')
const router = express.Router()
const userTokenVerificationController = require('../controllers/userTokenVerificationController')

router.post('/', userTokenVerificationController.handleLogin)

module.exports = router