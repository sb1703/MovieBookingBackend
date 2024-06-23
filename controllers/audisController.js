const axios = require("../config/axios")
const Audi = require("../model/Audi")

const emptySeats = [
  {Number: "A1", Status: "Available"},{Number: "A2", Status: "Available"},{Number: "A3", Status: "Available"},{Number: "A4", Status: "Available"},
  {Number: "A5", Status: "Available"},{Number: "A6", Status: "Available"},{Number: "A7", Status: "Available"},{Number: "A8", Status: "Available"},
  {Number: "B1", Status: "Available"},{Number: "B2", Status: "Available"},{Number: "B3", Status: "Available"},{Number: "B4", Status: "Available"},
  {Number: "B5", Status: "Available"},{Number: "B6", Status: "Available"},{Number: "B7", Status: "Available"},{Number: "B8", Status: "Available"},
  {Number: "C1", Status: "Available"},{Number: "C2", Status: "Available"},{Number: "C3", Status: "Available"},{Number: "C4", Status: "Available"},
  {Number: "C5", Status: "Available"},{Number: "C6", Status: "Available"},{Number: "C7", Status: "Available"},{Number: "C8", Status: "Available"},
  {Number: "D1", Status: "Available"},{Number: "D2", Status: "Available"},{Number: "D3", Status: "Available"},{Number: "D4", Status: "Available"},
  {Number: "D5", Status: "Available"},{Number: "D6", Status: "Available"},{Number: "D7", Status: "Available"},{Number: "D8", Status: "Available"},
  {Number: "E1", Status: "Available"},{Number: "E2", Status: "Available"},{Number: "E3", Status: "Available"},{Number: "E4", Status: "Available"},
  {Number: "E5", Status: "Available"},{Number: "E6", Status: "Available"},{Number: "E7", Status: "Available"},{Number: "E8", Status: "Available"},
  {Number: "F1", Status: "Reserved"},{Number: "F2", Status: "Reserved"},{Number: "F3", Status: "Reserved"},{Number: "F4", Status: "Reserved"},
  {Number: "F5", Status: "Reserved"},{Number: "F6", Status: "Reserved"},{Number: "F7", Status: "Reserved"},{Number: "F8", Status: "Reserved"}
]

const getShows = async (req, res) => {
  const { audi, date } = req?.body
  if (!audi || !date)
    return res.status(400).json({ message: "Audi and Date are required." })

  const foundMovies = await Audi.find({ }).exec()

  let shows = []
  
  foundMovies.forEach((movieEle) => {
    movieEle.Date.forEach((dateEle) => {
      if(dateEle.Date === date) {
        dateEle.Time.forEach((timeEle) => {
          // console.log(`timeEle: ${timeEle}`)
          timeEle.Audis.forEach((audiEle) => {
            // console.log(`audiEle1: ${audiEle}`)
            if(audiEle.Number === parseInt(audi)) {
              // console.log(`audiEle: ${audiEle}`)
              shows.push({
                Time: timeEle.Time,
                Movie: movieEle.MovieId
              })
            }
          })
        })
      }
    })
  })

  // const shows = foundDate.Time.sort((a, b) => {
  //   const time1A = a.Time.split("-")[0]
  //   const time1B = b.Time.split("-")[0]
  //   return time1A.localeCompare(time1B)
  // })

  res.status(200).json(shows)
}

const addShow = async (req, res) => {
  const { number, date, time, movie } = req?.body
  if (!number || !date || !time || !movie)
    return res.status(400).json({
      message: "Audi number, date, time, and movie are required.",
    })

  const foundMovie = await Audi.findOne({ MovieId: movie }).exec()
  if (!foundMovie) {
    const newMovie = new Audi({
      MovieId: movie,
      Date: [{ Date: date, Time: [{ Time: time, Audis: [{ Number: number, Seats: emptySeats }] }] }]
    })
    await newMovie.save()
    return res.status(200).json({ message: "Show added successfully." })
  }

  if(foundMovie.Date.find((show) => show.Date === date)) {
    const foundDate = foundMovie.Date.find((show) => show.Date === date)
    const checkTime = foundDate.Time.find((show) => {
      const [start, end] = show.Time.split("-")
      const [newStart, newEnd] = time.split("-")
      if(newStart >= start && newStart <= end) return true
      if(newEnd >= start && newEnd <= end) return true
      if(start >= newStart && start <= newEnd) return true
      if(end >= newStart && end <= newEnd) return true
      return false
    })
    if(checkTime && checkTime.Audis.find((show) => show.Number === number)){
      return res.status(401).json({ message: "Show already exists." })
    }

    if(checkTime && !checkTime.Audis.find((show) => show.Number === number)){
      checkTime.Audis.push({ Number: number, Seats: emptySeats })
      await foundMovie.save()
      return res.status(200).json({ message: "Show added successfully." })
    }

    foundDate.Time.push({ Time: time, Audis: [{ Number: number, Seats: emptySeats }] })
    await foundMovie.save()
    res.status(200).json({ message: "Show added successfully." })
  } else {
    foundMovie.Date.push({ Date: date, Time: [{ Time: time, Audis: [{ Number: number, Seats: emptySeats }] }] })
    await foundMovie.save()
  }
}

const removeShow = async (req, res) => {
  const { movieId, number, date, time } = req?.body
  if (!number || !date || !time || !movieId)
    return res.status(400).json({
      message: "Audi number, date, and time are required.",
    })

  const foundMovie = await Audi.findOne({ MovieId: movieId }).exec()

  if (!foundMovie)
    return res
      .status(401)
      .json({ message: `No movie found with movieId ${movieId}.` })

  if (foundMovie.Date.find((show) => show.Date === date)) {
    const foundDate = foundMovie.Date.find((show) => show.Date === date)
    const index = foundDate.Time.findIndex((show) => show.Time === time)
    if (index === -1)
      return res.status(401).json({ message: "Show not found." })

    foundDate.Time.splice(index, 1)
    await foundMovie.save()
    res.status(200).json({ message: "Show removed successfully." })

  } else {
    return res.status(401).json({ message: "Show not found." })
  }
}

const getDates = async (req, res) => {
  const { movieId } = req?.body
  if (!movieId)
    return res.status(400).json({
      message: "movieId is required.",
    })

  const foundMovie = await Audi.findOne({ MovieId: movieId }).exec()

  if (!foundMovie)
    return res
      .status(401)
      .json({ message: `No movie found with movieId ${movieId}.` })

  return res.status(200).json({ dates: foundMovie.Date.map((show) => { if(show.Time.length > 0) return show.Date } ) })
}

const getTimes = async (req, res) => {
  const { movieId, date } = req?.body
  if (!movieId || !date)
    return res.status(400).json({
      message: "movieId and date are required.",
    })

  const foundMovie = await Audi.findOne({ MovieId: movieId }).exec()

  if (!foundMovie)
    return res
      .status(401)
      .json({ message: `No movie found with movieId ${movieId}.` })

  const foundDate = foundMovie.Date.find((show) => show.Date === date)

  if (!foundDate)
    return res
      .status(401)
      .json({ message: `No date found with date ${date}.` })

  return res.status(200).json({ times: foundDate.Time.map((show) => show.Time) })
}

const getAudis = async (req, res) => {
  const { movieId, date, time } = req?.body
  if (!movieId || !date || !time)
    return res.status(400).json({
      message: "movieId, date and time are required.",
    })

  const foundMovie = await Audi.findOne({ MovieId: movieId }).exec()

  if (!foundMovie)
    return res
      .status(401)
      .json({ message: `No movie found with movieId ${movieId}.` })

  const foundDate = foundMovie.Date.find((show) => show.Date === date)

  if (!foundDate)
    return res
      .status(401)
      .json({ message: `No date found with date ${date}.` })

  const foundTime = foundDate.Time.find((show) => show.Time === time)

  if (!foundTime)
    return res
      .status(401)
      .json({ message: `No time found with time ${time}.` })

  // console.log(`foundTime: ${foundTime.Audis}`)    
  return res.status(200).json({ audis: foundTime.Audis })
}

const getSeats = async (req, res) => {
  const { movieId, date, time, audi } = req?.body
  if (!movieId || !date || !time || !audi)
    return res.status(400).json({
      message: "movieId, date, time and audi are required.",
    })

  const foundMovie = await Audi.findOne({ MovieId: movieId }).exec()

  if (!foundMovie)
    return res
      .status(401)
      .json({ message: `No movie found with movieId ${movieId}.` })

  const foundDate = foundMovie.Date.find((show) => show.Date === date)

  if (!foundDate)
    return res
      .status(401)
      .json({ message: `No date found with date ${date}.` })

  const foundTime = foundDate.Time.find((show) => show.Time === time)

  if (!foundTime)
    return res
      .status(401)
      .json({ message: `No time found with time ${time}.` })

  const foundAudi = foundTime.Audis.find((show) => show.Number === audi)

  if (!foundAudi)
    return res
      .status(401)
      .json({ message: `No audi found with audi ${audi}.` })

  return res.status(200).json({ seats: foundAudi.Seats })
}

module.exports = {
  addShow,
  removeShow,
  getShows,
  getDates,
  getTimes,
  getAudis,
  getSeats,
}