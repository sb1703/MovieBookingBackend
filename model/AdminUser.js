const mongoose = require('mongoose')
const Schema = mongoose.Schema

const adminUserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    roles: {
        Editor: {
            type: Number,
            default: 1984
        },
        Admin: Number
    },
    password: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('AdminUser', adminUserSchema)