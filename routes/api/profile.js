const express = require("express");
const router = express.Router();
// Bring in auth middleware for protected routes
const auth = require("../../middleware/auth");
//Bring in the models
const User = require("../../models/User");
const Profile = require("../../models/Profile");

// @route GET api/profile/me
// @desc Get current users profile by the user id in the token
// @access Private
router.get("/me", auth, async (req, res) => {
  try {
    // Get the profile based on the token
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );

    if (!profile) {
      return res
        .status(400)
        .json({ msg: "There is no profile for this user." });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sever Error");
  }
});

//Export the router
module.exports = router;
