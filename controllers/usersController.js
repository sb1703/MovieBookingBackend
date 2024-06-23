const axios = require("../config/axios")
const User = require("../model/User")
const Movie = require("../model/Movie")

const getUser = async (req, res) => {
  const { userId } = req?.body
  if (!userId) return res.status(400).json({ message: "userId is required." })

  const foundUser = await User.findOne({ _id: userId }).exec()
  if (!foundUser)
    return res
      .status(401)
      .json({ message: `No user found with userId ${userId}.` })

  res.status(200).json({ user: foundUser })
}

const getUserByMail = async (req, res) => {
  const { emailAddress } = req?.body
  if (!emailAddress) return res.status(400).json({ message: "emailAddress is required." })

  const foundUser = await User.findOne({ emailAddress: emailAddress }).exec()
  if (!foundUser)
    return res
      .status(401)
      .json({ message: `No user found with emailAddress ${emailAddress}.` })

  res.status(200).json({ user: foundUser })
}

const getTickets = async (req, res) => {
  const { userId } = req?.body
  if (!userId) return res.status(400).json({ message: "userId is required." })

  const foundUser = await User.findOne({ _id: userId }).exec()
  if (!foundUser)
    return res
      .status(401)
      .json({ message: `No user found with userId ${userId}.` })

  res.status(200).json({ tickets: foundUser.tickets })
}

const getWatchLater = async (req, res) => {
  const { userId } = req?.body
  if (!userId) return res.status(400).json({ message: "userId is required." })

  const foundUser = await User.findOne({ _id: userId }).exec()
  if (!foundUser)
    return res
      .status(401)
      .json({ message: `No user found with userId ${userId}.` })

  res.status(200).json({ watchLater: foundUser.moviesWatchLater })
}

const addTicket = async (req, res) => {
  const { userId, movieId, date, time, seats, barcode } = req?.body
  if (!userId || !movieId || !date || !time || !seats || !barcode)
    return res.status(400).json({
      message: "userId, movieId, date, time, seats, barcode are required.",
    })

  const foundUser = await User.findOne({ _id: userId }).exec()
  if (!foundUser)
    return res
      .status(401)
      .json({ message: `No user found with userId ${userId}.` })

  const foundMovie = await Movie.findOne({ _id: movieId }).exec()
  if (!foundMovie)
    return res
      .status(401)
      .json({ message: `No movie found with movieId ${movieId}.` })

  const seatsList = seats.split(",")

  foundUser.tickets.push({ movieId, movieTitle: foundMovie.Title, image: foundMovie.Poster, barcode, date, time, seatsList })
  await foundUser.save()
  res.status(200).json({ message: "Ticket added successfully." })
}

const removeTicket = async (req, res) => {
  const { userId, ticketId } = req?.body
  if (!userId || !ticketId)
    return res.status(400).json({
      message: "userId, ticketId are required.",
    })

  const foundUser = await Audi.findOne({ _id: movieId }).exec()
  if (!foundUser)
    return res
      .status(401)
      .json({ message: `No user found with userId ${userId}.` })

  if (
    foundUser.tickets.find(
      (ticket) =>
        ticket._id === ticketId
    )
  ) {
    const index = foundUser.tickets.findIndex(
      (ticket) =>
        ticket._id === ticketId
    )
    foundUser.tickets.splice(index, 1)
    await foundUser.save()
    res.status(200).json({ message: "Ticket removed successfully." })
  } else {
    return res.status(401).json({ message: "Ticket not found." })
  }
}

const addWatchLater = async (req, res) => {
  const { userId, movieId } = req?.body
  if (!userId || !movieId)
    return res.status(400).json({
      message: "userId and movieId are required.",
    })

  const foundUser = await Audi.findOne({ _id: movieId }).exec()
  if (!foundUser)
    return res
      .status(401)
      .json({ message: `No user found with userId ${userId}.` })

  if (foundUser.moviesWatchLater.find((movie) => movie === movieId)) {
    return res.status(401).json({ message: "Movie already exists." })
  }

  foundUser.moviesWatchLater.push(movieId)
  await foundUser.save()
  res.status(200).json({ message: "Movie added successfully." })
}

const removeWatchLater = async (req, res) => {
  const { userId, movieId } = req?.body
  if (!userId || !movieId)
    return res.status(400).json({
      message: "userId and movieId are required.",
    })

  const foundUser = await Audi.findOne({ _id: movieId }).exec()
  if (!foundUser)
    return res
      .status(401)
      .json({ message: `No user found with userId ${userId}.` })

  if (foundUser.moviesWatchLater.find((movie) => movie === movieId)) {
    const index = foundUser.moviesWatchLater.findIndex(
      (movie) => movie === movieId
    )
    foundUser.moviesWatchLater.splice(index, 1)
    await foundUser.save()
    res.status(200).json({ message: "Movie removed successfully." })
  } else {
    return res.status(401).json({ message: "Movie not found." })
  }
}

const getAllMoviesFromDB = async (req, res) => {
  if (!req?.body || !req?.body?.query || req?.body.query === "") {
    const movies = await Movie.find({}).exec()

    const filteredMovieObjects = movies.map((movie) => {
      return {
        id: movie._id,
        url: movie.Poster,
        title: movie.Title
      }
    })

    return res.status(200).json({ movies: filteredMovieObjects})
  }

  const { query } = req?.body

  const REGEX = new RegExp(".*" + query + ".*", "gi")

  const filteredMovies = await Movie.find({ Title: REGEX }).exec()
  if (!filteredMovies)
    return res.status(401).json({ message: `No movies found.` })

  const filteredMovieObjects = filteredMovies.map((movie) => {
    return {
      id: movie._id,
      url: movie.Poster,
      title: movie.Title
    }
  })

  res.status(200).json({ movies: filteredMovieObjects})
}

const getMovieFromDB = async (req, res) => {
  
  if (!req?.body || !req?.body?.movieId || req?.body.movieId === "")
    return res.status(400).json({ message: "Movie id required" })

  const { movieId } = req?.body

  const foundMovie = await Movie.findOne({ _id: movieId }).exec()
  if (!foundMovie)
    return res
      .status(401)
      .json({ message: `No movie found with ${movieId}.` })

  res.status(200).json({ movie: foundMovie })
}

module.exports = {
  getUser,
  getUserByMail,
  addWatchLater,
  removeWatchLater,
  getTickets,
  getWatchLater,
  addTicket,
  removeTicket,
  getAllMoviesFromDB,
  getMovieFromDB
}
