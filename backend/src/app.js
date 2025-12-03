const express = require("express")
const songRoute = require("./routes/song.routes")

const app = express()

app.use(express.json())
app.use("/", songRoute)


module.exports = app