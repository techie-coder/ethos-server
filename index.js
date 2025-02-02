
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors')
const fs = require('fs')
const morgan = require('morgan')
const https = require('https')
const path = require('path')
const dotenv = require('dotenv')
dotenv.config()

const app = express()
app.use(morgan("dev"))

const authRoutes = require("./routes/auth");
const searchRoutes = require("./routes/search");

app.use(express.json());
app.use(cors())

app.use("/auth", authRoutes);
app.use("/search", searchRoutes);


app.get("/", (req, res) => {
  res.send("This API is running live🥳");
});

const options = {
  key: fs.readFileSync(path.join(__dirname, "localhost-key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "localhost.pem")),
}

const server = https.createServer(options, app)

mongoose
  .connect(`${process.env.DB_CONNECTION_STRING}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    const PORT = process.env.PORT || 443;
    server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch((err) => console.log(err));