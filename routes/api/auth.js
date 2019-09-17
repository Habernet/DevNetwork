const express = require("express");
const router = express.Router();
// Bring in our custom middleware
const auth = require("../../middleware/auth");
// Bring in the user model
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");
//Bring in the middleware to validate the req.body;
const { check, validationResult } = require("express-validator");

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
    res.status(500).send("Server Error for GET to /api/auth");
  }
});

// @route POST api/auth
// @desc authenticate the user and then get the token
// @access Public
router.post(
  "/",
  [
    check("email", "Please include a valid email.").isEmail(),
    check("password", "Password required.").exists()
  ],
  async (req, res) => {
    //Get your errors
    const errors = validationResult(req);
    //If they exist..respond accordingly
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //Destructure the req.body
    const { email, password } = req.body;

    try {
      // See if user exists
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials." }] });
      }

      //User has been found so match the password, we do that with the password they entered into the req (plain text), and the encrtypted password we got back from the DB in the above query.
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials." }] });
      }

      //Create the payload for the token
      const payload = {
        user: {
          id: user.id
        }
      };

      // Sign the token and send it back to the client

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

      // return the json web token
    } catch (err) {
      console.error(err.message);
      //   console.log(err);
      res.status(500).send("Server Error for POST to /api/auth");
    }
  }
);

//Export the route
module.exports = router;
