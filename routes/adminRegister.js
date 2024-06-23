const express = require('express')
const router = express.Router()
const adminRegisterController = require('../controllers/adminRegisterController')
const verifyAdmin = require('../middleware/verifyAdmin')

router.post('/', verifyAdmin, adminRegisterController.handleNewUser)

module.exports = router