const express = require('express')
const router = express.Router()
const usersController = require('../../controllers/usersController')

router.route('/getUser')
    .post(usersController.getUser)

router.route('/getUserByMail')
    .post(usersController.getUserByMail)

router.route('/getTickets')
    .post(usersController.getTickets)

router.route('/getWatchLater')
    .post(usersController.getWatchLater)

router.route('/addWatchLater')
    .post(usersController.addWatchLater)

router.route('/removeWatchLater')
    .post(usersController.removeWatchLater)

router.route('/addTicket')
    .post(usersController.addTicket)

router.route('/removeTicket')
    .post(usersController.removeTicket)

router.route('/movieDBDetails')
    .post(usersController.getMovieFromDB)

router.route('/movieDBAll')
    .post(usersController.getAllMoviesFromDB)

module.exports = router