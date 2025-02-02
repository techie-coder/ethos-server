
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors')
const app = express();

const dotenv = require('dotenv')
dotenv.config()

const authRoutes = require("./routes/auth");
const searchRoutes = require("./routes/search");

app.use(express.json());
app.use(cors())

app.use("/auth", authRoutes);
app.use("/search", searchRoutes);


app.get("/", (req, res) => {
  res.send("This API is running live🥳");
});

mongoose
  .connect(`${process.env.DB_CONNECTION_STRING}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch((err) => console.log(err));