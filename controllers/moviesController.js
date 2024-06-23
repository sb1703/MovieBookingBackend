const axios = require("../config/axios")
const Movie = require("../model/Movie")
const { getImagesFromImdbId } = require("../imdbScraping/imagesImdbScraping")
const { getVideosFromImdbId } = require("../imdbScraping/videosImdbScraping")
const { initializeApp } = require("firebase/app")
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
} = require("firebase/storage")
const { firebaseConfig } = require("../config/firebase.config")

initializeApp(firebaseConfig)

const storageFB = getStorage()

const getMovie = async (req, res) => {
  if (!req?.params?.name)
    return res.status(400).json({ message: "Movie name required" })

  const movie = await axios.get(
    `?t=${req?.params?.name}&apikey=${process.env.API_KEY}`
  )
  if (!movie) {
    return res
      .status(400)
      .json({ message: `No movie matches name ${req?.params?.name}.` })
  }

  if (req?.body?.media === "true") {
    const imagesMovie = await getImagesFromImdbId(movie.data.imdbID)
    const videosMovie = await getVideosFromImdbId(movie.data.imdbID)
    movie.data.Images = imagesMovie
    movie.data.Videos = videosMovie
  }

  return res.status(200).json(movie.data)
}

const createMovie = async (req, res) => {
  if (!req?.body) return res.status(400).json({ message: "Empty Body" })

  const {
    title,
    year,
    runtime,
    director,
    writer,
    actors,
    genre,
    imdbRating,
    imageUrls: imgUrls,
    videoUrls: vidUrls,
    plot,
  } = req?.body
  const images = req?.files["images"]
  const videos = req?.files["videos"]

  const duplicate = await Movie.findOne({ Title: title }).exec()
  if (duplicate)
    return res
      .status(409)
      .json({ message: `Movie with ${title} already exists.` }) // conflict

  try {
    // Upload images and get their download URLs
    const imageUrls = images
      ? await Promise.all(
          images.map(async (image) => {
            const dateTime = Date.now()
            const fileName = `images/${dateTime}`
            const storageRef = ref(storageFB, fileName)
            await uploadBytesResumable(storageRef, image.buffer, {
              contentType: image.mimetype,
            })
            return getDownloadURL(storageRef)
          })
        )
      : []

    // Upload videos and get their download URLs
    const videoUrls = videos
      ? await Promise.all(
          videos.map(async (video) => {
            const dateTime = Date.now()
            const fileName = `videos/${dateTime}`
            const storageRef = ref(storageFB, fileName)
            await uploadBytesResumable(storageRef, video.buffer, {
              contentType: video.mimetype,
            })
            return getDownloadURL(storageRef)
          })
        )
      : []

    const newMovie = await Movie.create({
      Title: title,
      Year: year,
      Runtime: runtime,
      Director: director,
      Writer: writer,
      Actors: actors,
      Genre: genre,
      imdbRating: imdbRating,
      Plot: plot,
      Images: [...imageUrls, ...JSON.parse(imgUrls)],
      Videos: [...videoUrls, ...JSON.parse(vidUrls)],
      Poster: ([...JSON.parse(imgUrls)].length > 0) ? [...JSON.parse(imgUrls)][0] : "",
    })

    res.status(201).json({ success: `New movie ${title} created!` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const updateMovie = async (req, res) => {
  console.log("updateMovie")
  if (!req?.body) return res.status(400).json({ message: "Empty Body" })

  console.log("not empty body")
  const {
    _id,
    title,
    year,
    runtime,
    director,
    writer,
    actors,
    genre,
    imdbRating,
    imageUrls: imgUrls,
    videoUrls: vidUrls,
    plot,
  } = req?.body
  const images = req?.files["images"]
  const videos = req?.files["videos"]

  const foundMovie = await Movie.findOne({ _id }).exec()
  if (!foundMovie)
    return res.status(401).json({ message: `No movie found with ${_id}.` })

  console.log("found movie")

  if (title) foundMovie["Title"] = title
  if (year) foundMovie["Year"] = year
  if (runtime) foundMovie["Runtime"] = runtime
  if (director) foundMovie["Director"] = director
  if (writer) foundMovie["Writer"] = writer
  if (actors) foundMovie["Actors"] = actors
  if (genre) foundMovie["Genre"] = genre
  if (imdbRating) foundMovie["imdbRating"] = imdbRating
  if (plot) foundMovie["Plot"] = plot

  console.log("updated movie fields")

  console.log(foundMovie["Images"])
  console.log(foundMovie["Videos"])

  try {
    // Delete existing images and videos from storage
    // if (foundMovie["Images"].length > 0) {
    //   const deletePromises = foundMovie["Images"].map((url) => {
    //     if (!url.includes("firebasestorage"))
    //       return Promise.resolve("Nothing to delete")
    //     console.log("deleting image - " + url)

    //     const path = decodeURIComponent(url.split("/o/")[1].split("?alt=")[0])

    //     console.log("image path - " + path)
    //     // Create a reference to the file to delete
    //     const storageRef = ref(storageFB, path)

    //     // Delete the file
    //     return deleteObject(storageRef).catch((error) => {
    //       if (error.code === "storage/object-not-found") {
    //         console.log("Image not found:", url)
    //       } else {
    //         throw error // Re-throw the error if it's not an 'object-not-found' error
    //       }
    //     })
    //   })

    //   // Wait for all deletions to complete
    //   await Promise.all(deletePromises)

    //   // Clear the imageUrls array
    //   foundMovie["Images"] = foundMovie["Images"].filter(
    //     (url) => !url.includes("firebasestorage")
    //   )
    // }

    // console.log("deleted images")

    // console.log(foundMovie["Images"])
    // console.log(foundMovie["Videos"])

    // if (foundMovie["Videos"].length > 0) {
    //   const deletePromises = foundMovie["Videos"].map((url) => {
    //     if (!url.includes("firebasestorage"))
    //       return Promise.resolve("Nothing to delete")
    //     console.log("deleting video" + url)

    //     const path = decodeURIComponent(url.split("/o/")[1].split("?alt=")[0])
    //     // Create a reference to the file to delete
    //     const storageRef = ref(storageFB, path)

    //     // Delete the file
    //     return deleteObject(storageRef).catch((error) => {
    //       if (error.code === "storage/object-not-found") {
    //         console.log("Video not found:", url)
    //       } else {
    //         throw error // Re-throw the error if it's not an 'object-not-found' error
    //       }
    //     })
    //   })

    //   // Wait for all deletions to complete
    //   await Promise.all(deletePromises)

    //   // Clear the imageUrls array
    //   foundMovie["Videos"] = foundMovie["Videos"].filter(
    //     (url) => !url.includes("firebasestorage")
    //   )
    // }

    // console.log("deleted videos")

    // console.log(foundMovie["Images"])
    // console.log(foundMovie["Videos"])

    // Upload images and get their download URLs
    const imageUrls = images
      ? await Promise.all(
          images.map(async (image) => {
            const dateTime = Date.now()
            const fileName = `images/${dateTime}`
            const storageRef = ref(storageFB, fileName)
            await uploadBytesResumable(storageRef, image.buffer, {
              contentType: image.mimetype,
            })
            return getDownloadURL(storageRef)
          })
        )
      : []

    console.log("uploaded images")

    // Upload videos and get their download URLs
    const videoUrls = videos
      ? await Promise.all(
          videos.map(async (video) => {
            const dateTime = Date.now()
            const fileName = `videos/${dateTime}`
            const storageRef = ref(storageFB, fileName)
            await uploadBytesResumable(storageRef, video.buffer, {
              contentType: video.mimetype,
            })
            return getDownloadURL(storageRef)
          })
        )
      : []

    console.log("uploaded videos")

    foundMovie["Images"] = [...imageUrls, ...JSON.parse(imgUrls)]
    foundMovie["Videos"] = [...videoUrls, ...JSON.parse(vidUrls)]

    console.log("updated movie")

    console.log(foundMovie["Images"])
    console.log(foundMovie["Videos"])

    const result = await foundMovie.save()

    res.status(200).json({ success: `Movie ${_id} updated!` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getMovieFromDB = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Movie id required" })

  const foundMovie = await Movie.findOne({ _id: req?.params?.id }).exec()
  if (!foundMovie)
    return res
      .status(401)
      .json({ message: `No movie found with ${req?.params?.id}.` })

  res.status(200).json(foundMovie)
}

const getAllMoviesFromDB = async (req, res) => {
  if (!req?.body || req?.body.query === "")
    return res.status(200).json(await Movie.find({}).exec())

  const { query } = req?.body

  const REGEX = new RegExp(".*" + query + ".*", "gi")

  const filteredMovies = await Movie.find({ Title: REGEX }).exec()
  if (!filteredMovies)
    return res.status(401).json({ message: `No movies found.` })

  res.status(200).json(filteredMovies)
}

async function uploadImage(file) {
  for (let i = 0; i < file.images.length; i++) {
    const dateTime = Date.now()
    const fileName = `images/${dateTime}`
    const storageRef = ref(storageFB, fileName)
    const metadata = {
      contentType: file.images[i].mimetype,
    }

    const saveImage = await Image.create({ imageUrl: fileName })
    file.item.imageId.push({ _id: saveImage._id })
    await file.item.save()

    await uploadBytesResumable(storageRef, file.images[i].buffer, metadata)
  }
  return
}

async function uploadVideo(file) {
  for (let i = 0; i < file.videos.length; i++) {
    const dateTime = Date.now()
    const fileName = `videos/${dateTime}`
    const storageRef = ref(storageFB, fileName)
    const metadata = {
      contentType: file.videos[i].mimetype,
    }

    const saveVideo = await Video.create({ videoUrl: fileName })
    file.item.videoId.push({ _id: saveVideo._id })
    await file.item.save()

    await uploadBytesResumable(storageRef, file.videos[i].buffer, metadata)
  }
  return
}

module.exports = {
  getMovie,
  createMovie,
  updateMovie,
  getMovieFromDB,
  getAllMoviesFromDB,
}
