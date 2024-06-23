const express = require('express')
const router = express.Router()
const adminAuthController = require('../controllers/adminAuthController')
const sessionChecker = require('../middleware/sessionChecker')

router.post('/', sessionChecker, adminAuthController.handleLogin)

module.exports = router