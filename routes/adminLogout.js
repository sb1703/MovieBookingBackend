const express = require('express')
const router = express.Router()
const adminLogoutController = require('../controllers/adminLogoutController')

router.get('/', adminLogoutController.handleLogout)

module.exports = router