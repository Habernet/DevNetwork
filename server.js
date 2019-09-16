//Bring in express
const express = require("express");
//Mongo DB
const connectDB = require("./config/db");
//Initialize express app
const app = express();
//Connect to the DB
connectDB();

//Routes
app.get("/", (req, res) => res.send("API Running"));

// Define port based on deployment
const PORT = process.env.PORT || 5000;

//Kick off the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`);
});
