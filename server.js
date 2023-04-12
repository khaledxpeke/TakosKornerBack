const express = require('express');
const app = express();
const connectDB = require("./db/db");
const cors = require("cors")


app.use(cors({
  origin: "*",
  credentials: true
}))

app.use(express.json());
connectDB();
server = app.listen(3000, function () {
  console.log("Server is listening on port 3000");
});