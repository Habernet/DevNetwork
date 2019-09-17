const express = require("express");
const router = express.Router();
//Bring in the middleware to validate the req.body;
const { check, validationResult } = require("express-validator");

// @route GET api/users
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
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.send("User route");
  }
);

//Export the route
module.exports = router;
