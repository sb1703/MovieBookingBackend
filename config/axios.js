const axios = require('axios')

module.exports = axios.create({
    baseURL: `${process.env.OMDB_API_BASE_URL}`
})