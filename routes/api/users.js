const express = require("express");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const router = express.Router();

//Bring in the middleware to validate the req.body;
const { check, validationResult } = require("express-validator");

// Bring in the users model
const User = require("../../models/User");

// @route POST api/users
// @desc Register a user
// @access Public
// Post: 1.route 2. array of check methods 3. callback
router.post(
  "/",
  [
    check("name", "Name is required.")
      .not()
      .isEmpty(),
    check("email", "Please include a valid email.").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters!"
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    //Get your errors
    const errors = validationResult(req);
    //If they exist..respond accordingly
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //Destructure the req.body
    const { name, email, password } = req.body;

    try {
      // See if user exists
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists." }] });
      }

      // Get users gravatar based on their email
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm"
      });

      // We now have enough to create a new user. Let's do that..but it's not saved to the DB yet! We still have to encrypt the password
      user = new User({
        name,
        email,
        avatar,
        password
      });

      // Encrypt the password using bcrypt

      //Create salt in order to hash the password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      // Save the user to the DB
      await user.save();

      // return the json web token
      res.send("User registered.");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//Export the route
module.exports = router;
