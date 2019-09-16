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

//Define routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));

// Define port based on deployment
const PORT = process.env.PORT || 5000;

//Kick off the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`);
});
