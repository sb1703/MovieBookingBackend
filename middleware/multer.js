const multer = require("multer")
const path = require("path")

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50000000 },
  fileFilter: function (req, file, cb) {
    console.log(file)
    if (file.fieldname === "images") {
      checkImageType(file, cb)
    } else if (file.fieldname === "videos") {
      checkVideoType(file, cb)
    } else {
      cb("Error: Unexpected field")
    }
  },
})

const uploadMultipleFiles = upload.fields([
  { name: "images", maxCount: 50 },
  { name: "videos", maxCount: 25 },
])

function checkImageType(file, cb) {
  console.log(`IMAGE - ${file.originalname}`)
  const fileTypes = /\.jpeg|\.jpg|\.png|\.gif|\.svg/
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase())

  if (extName) {
    return cb(null, true)
  } else {
    cb("Error: Images Only!")
  }
}

function checkVideoType(file, cb) {
  console.log(`VIDEO - ${file.originalname}`)
  const fileTypes = /mp4|mkv|avi|mov|wmv/
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase())

  if (extName) {
    return cb(null, true)
  } else {
    cb("Error: Videos Only!")
  }
}

module.exports = { uploadMultipleFiles }
