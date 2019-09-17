const express = require("express");
const router = express.Router();
// Bring in our custom middleware
const auth = require("../../middleware/auth");
// Bring in the user model
const Usedr = require("../../models/User");

// @route GET api/auth
// @desc Test route
// @access Public
router.get("/", auth, async (req, res) => {
  try {
    // Because this route is protected, we have the user.id. Find the user in the DB
    const user = await User.findById(req.user.id).select("-password");
    //Respond with the user object minus the password
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//Export the route
module.exports = router;
