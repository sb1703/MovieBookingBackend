const express = require('express')
const router = express.Router()
const moviesController = require('../../controllers/moviesController')
const { uploadMultipleFiles } = require('../../middleware/multer')

router.route('/api/:name')
    .post(moviesController.getMovie)

router.route('/db/:id')
    .get(moviesController.getMovieFromDB)

router.route('/new')
    .post(uploadMultipleFiles, moviesController.createMovie)

router.route('/update')
    .post(uploadMultipleFiles, moviesController.updateMovie)

router.route('/all')
    .post(moviesController.getAllMoviesFromDB)

module.exports = router