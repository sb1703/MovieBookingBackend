const mongoose = require('mongoose')
const Schema = mongoose.Schema

const movieSchema = new Schema({
    Title: {
        type: String,
        required: true
    },
    Year: {
        type: String,
        required: true
    },
    Released: {
        type: String,
        required: false
        // required: true
    },
    Runtime: {
        type: String,
        required: true
    },
    Genre: {
        type: String,
        required: true
    },
    Director: {
        type: String,
        required: true
    },
    Writer: {
        type: String,
        required: true
    },
    Actors: {
        type: String,
        required: true
    },
    Plot: {
        type: String,
        required: true
    },
    Poster: {
        type: String,
        required: false
        // required: true
    },
    imdbRating: {
        type: String,
        required: true
    },
    imdbID: {
        type: String,
        required: false
        // required: true
    },
    Type: {
        type: String,
        required: false
        // required: true
    },
    Videos: {
        type: Array,
        required: false
        // required: true
    },
    Images: {
        type: Array,
        required: false
        // required: true
    }
})

module.exports = mongoose.model('Movie',movieSchema)