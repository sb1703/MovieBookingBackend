const mongoose = require('mongoose')
const Schema = mongoose.Schema

const seatSchema = new Schema({
    Number: {
        type: String,
        required: true
    },
    Status: {
        type: String,
        required: true
    },
    UserId: {
        type: String,
        required: false
    },
    PaidStatus: {
        type: String,
        required: false
    }
})

const seatsSchema = new Schema({
    Number: {
        type: Number,
        required: true
    },
    Seats: {
        type: [seatSchema],
        required: true
    }
})

const timeSchema = new Schema({
    Time: {
        type: String,
        required: true
    },
    Audis: {
        type: [seatsSchema],
        required: true
    }
})

const dateSchema = new Schema({
    Date: {
        type: String,
        required: true
    },
    Time: {
        type: [timeSchema],
        required: true
    }
})

const audiSchema = new Schema({
    MovieId: {
        type: String,
        required: true
    },
    Date: {
        type: [dateSchema],
        required: true
    }
})

module.exports = mongoose.model('Audi',audiSchema)