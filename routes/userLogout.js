const express = require('express')
const router = express.Router()
const userLogoutController = require('../controllers/userLogoutController')

router.get('/', userLogoutController.handleLogout)

module.exports = router