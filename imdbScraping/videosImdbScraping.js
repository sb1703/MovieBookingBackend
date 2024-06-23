const request = require("request-promise")
const cheerio = require("cheerio")

const REGEX_VIDEO_URL = /"videoMimeType":"MP4","videoDefinition":"[\S](.*?)","url":"https:\/\/imdb-video\.media-imdb\.com[\S](.*?)","__typename"/g

async function getVideosFromImdbId(id) {
    try {
        const result = await request.get(process.env.IMDB_BASE_URL + id)
        const $ = await cheerio.load(result)
        const videoUrls = $('#__NEXT_DATA__').text()
        const matches = videoUrls.match(REGEX_VIDEO_URL)
        if(!matches) {
            return []
        }
        const res = matches.map(match => {
            const removedTypeName = match.slice(0,-13)
            const newJsonString = `{${removedTypeName}}`
            const videoJson = JSON.parse(newJsonString)
            return videoJson.url
        })
        return res
    } catch (err) {
        console.error(err)
    }
}

module.exports = { getVideosFromImdbId }