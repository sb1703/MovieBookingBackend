const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ticketSchema = new Schema({
    movieId: {
        type: String,
        required: true
    },
    movieTitle: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    barcode: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    seats: {
        type: Array,
        required: true
    },
})

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    emailAddress: {
        type: String,
        required: true
    },
    profilePhoto: {
        type: String,
        required: true
    },
    moviesWatchLater: {
        type: Array,
        required: false
        // required: true
    },
    tickets: {
        type: [ticketSchema],
        required: false
        // required: true
    }
})

module.exports = mongoose.model('User', userSchema)