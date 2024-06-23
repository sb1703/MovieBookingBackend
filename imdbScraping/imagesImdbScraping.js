const request = require("request-promise")
const cheerio = require("cheerio")

const REGEX_IMAGE_URL = /https:\/\/m\.media-amazon\.com\/images\/[\S]*\.jpg/g

async function getImagesFromImdbId(id) {
    try {
        const result = await request.get(process.env.IMDB_BASE_URL + id + '/mediaviewer')
        const $ = await cheerio.load(result)
        const imagesUrls = $('#__NEXT_DATA__').text()
        const matches = imagesUrls.match(REGEX_IMAGE_URL)
        if(!matches) {
            return []
        }
        return matches
    } catch (err) {
        console.error(err)
    }
}

module.exports = { getImagesFromImdbId }