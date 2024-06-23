require("dotenv").config()
const express = require("express")
const session = require("express-session")
const app = express()
const path = require("path")
const ws = require('ws')
const cors = require("cors")
const cookieParser = require("cookie-parser")
const { logger } = require("./middleware/logEvents")
const errorHandler = require("./middleware/errorHandler")
const corsOptions = require("./config/corsOptions")
const credentials = require("./middleware/credentials")
const mongoose = require("mongoose")
const connectDB = require("./config/dbConn")
const bodyParser = require("body-parser")
const Audi = require("./model/Audi")
const server = new ws.Server({ port: '3000' })
const PORT = process.env.PORT || 3500

connectDB()

app.use(logger)

app.use(credentials)

app.use(cors(corsOptions))

app.use(express.json())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cookieParser())

app.use(
  session({
    name: "sessionIdCookie",
    secret: process.env.SECRET_EXPRESS_SESSION,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 3600000, // 1hr
      secure: false, // cookie is only accessible over HTTP, requires HTTPS
      sameSite: "none",
    },
  })
)

// routes
app.use("/adminRegister", require("./routes/adminRegister"))
app.use("/adminAuth", require("./routes/adminAuth"))
app.use("/adminLogout", require("./routes/adminLogout"))
app.use("/adminVerifySession", require("./routes/adminVerifySession"))

app.use("/userTokenVerification", require("./routes/userTokenVerification"))
app.use("/userLogout", require("./routes/userLogout"))
app.use("/userVerifySession", require("./routes/userVerifySession"))

app.use("/movies", require("./routes/api/movies"))

app.use("/audis", require("./routes/api/audis"))

app.use("/users", require("./routes/api/users"))

app.use("/payment", require("./routes/api/payment"))

app.use(errorHandler)

server.on('connection', (socket) => {
  socket.on('error', console.error)

  console.log('Client connected')
  socket.on('message', async (message) => {
    console.log('received: %s', message)
    try {
      const parsedJson = JSON.parse(message)
      if(parsedJson.event === "updateSelectedSeats") {
        console.log("matched updateSelectedSeats")
        await updateSelectedSeats(parsedJson.userId, parsedJson.movieId, parsedJson.date, parsedJson.time, parsedJson.audi, parsedJson.seats)

        // notify everyone else by sending the updated seats
        broadcast(socket, parsedJson)
      } else if(parsedJson.event === "clearoutSeats") {
        console.log("matched clearoutSeats")
        await clearoutSeats(parsedJson.movieId, parsedJson.date, parsedJson.time, parsedJson.audi, parsedJson.seats)

        // notify everyone else by sending the cleared out seats
        broadcast(socket, parsedJson)
      } else if(parsedJson.event === "paidSeats") {
        console.log("matched paidSeats")
        await paidSeats(parsedJson.movieId, parsedJson.date, parsedJson.time, parsedJson.audi, parsedJson.seats)

        // notify everyone else by sending the updated paid seats
        // broadcast(socket, parsedJson)
      }
    } catch(err) {
      console.error(err)
      return
    }
  })

  socket.on('close', () => console.log('Client disconnected'));
})

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB!")
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

const updateSelectedSeats = async (userId, movieId, date, time, audi, selectedSeats) => {
  console.log("Updating seats")
  const foundMovie = await Audi.findOne({ MovieId: movieId }).exec()

  if (!foundMovie)
    throw new Error('Movie not found')

  const foundDate = foundMovie.Date.find((show) => show.Date === date)

  if (!foundDate)
    throw new Error('Date not found')

  const foundTime = foundDate.Time.find((show) => show.Time === time)

  if (!foundTime)
    throw new Error('Time not found')

  const foundAudi = foundTime.Audis.find((show) => show.Number === parseInt(audi))

  if (!foundAudi)
    throw new Error('Audi not found')

  foundAudi.Seats.forEach((seat) => {
    if (selectedSeats.includes(seat.Number)) {
        seat.Status = "Reserved"
        seat.UserId = userId
    } else {
      if((seat.PaidStatus == null || seat.PaidStatus === "") && seat.UserId === userId) {
        seat.Status = "Available"
        seat.UserId = ""
      }
    }
  })

  try {
    await foundMovie.save()
    console.log("Updated seats")
    return { success: true }
  } catch (error) {
    throw new Error('Error saving movie: ' + error.message)
  }
}

const clearoutSeats = async (movieId, date, time, audi, selectedSeats) => {
  const foundMovie = await Audi.findOne({ MovieId: movieId }).exec()

  if (!foundMovie)
    throw new Error('Movie not found')

  const foundDate = foundMovie.Date.find((show) => show.Date === date)

  if (!foundDate)
    throw new Error('Date not found')

  const foundTime = foundDate.Time.find((show) => show.Time === time)

  if (!foundTime)
    throw new Error('Time not found')

  const foundAudi = foundTime.Audis.find((show) => show.Number === parseInt(audi))

  if (!foundAudi)
    throw new Error('Audi not found')

  selectedSeats.forEach((seat) => {
    const index = foundAudi.Seats.findIndex((foundSeat) => foundSeat.Number === seat)
    if (index !== -1) {
      foundAudi.Seats[index].Status = "Available"
      foundAudi.Seats[index].UserId = ""
    }
  })

  try {
    await foundMovie.save()
    console.log("Cleared out seats")
    return { success: true }
  } catch (error) {
    throw new Error('Error saving movie: ' + error.message)
  }
}

const paidSeats = async (movieId, date, time, audi, selectedSeats) => {
  console.log("Updating paid seats")
  const foundMovie = await Audi.findOne({ MovieId: movieId }).exec()

  if (!foundMovie)
    throw new Error('Movie not found')

  const foundDate = foundMovie.Date.find((show) => show.Date === date)

  if (!foundDate)
    throw new Error('Date not found')

  const foundTime = foundDate.Time.find((show) => show.Time === time)

  if (!foundTime)
    throw new Error('Time not found')

  const foundAudi = foundTime.Audis.find((show) => show.Number === parseInt(audi))

  if (!foundAudi)
    throw new Error('Audi not found')

  foundAudi.Seats.forEach((seat) => {
    if (selectedSeats.includes(seat.Number)) {
        seat.PaidStatus = "Paid"
    }
  })

  try {
    await foundMovie.save()
    console.log("Updated paid seats")
    return { success: true }
  } catch (error) {
    throw new Error('Error saving movie: ' + error.message)
  }
}

function broadcast(sender, message) {
  server.clients.forEach(function each(client) {
    if (client != sender && client.readyState === ws.OPEN) {
      // console.log(`sending message to client from broadcast ${JSON.stringify(message)}`)
      client.send(JSON.stringify(message));
    }
  });
}