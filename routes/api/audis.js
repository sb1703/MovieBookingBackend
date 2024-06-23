const express = require('express')
const router = express.Router()
const audisController = require('../../controllers/audisController')

router.route('/getShows')
    .post(audisController.getShows)

router.route('/addShow')
    .post(audisController.addShow)

router.route('/removeShow')
    .post(audisController.removeShow)

router.route('/getDates')
    .post(audisController.getDates)

router.route('/getTimes')
    .post(audisController.getTimes)

router.route('/getAudis')
    .post(audisController.getAudis)

router.route('/getSeats')
    .post(audisController.getSeats)

module.exports = router