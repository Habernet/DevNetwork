const express = require("express");
const router = express.Router();
// Bring in auth middleware for protected routes
const auth = require("../../middleware/auth");
//Bring in the models
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const { check, validationResult } = require("express-validator/check");

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

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required")
        .not()
        .isEmpty(),
      check("skills", "Skills is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map(skill => skill.trim());
    }

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      // Using upsert option (creates new doc if no match is found):
      let profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, upsert: true }
      );
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.err(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/profile/user/user_id
// @desc     Get profile by user id
// @access   Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]);
    if (!profile)
      return res.status(400).json({ msg: "No profile for this user." });
    res.json(profile);
  } catch (err) {
    console.err(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    DELETE api/profile
// @desc     Delete profile, user, and posts
// @access   Private
router.delete("/", auth, async (req, res) => {
  try {
    //@todo-remove users posts as well

    //Removes the profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //Removes the user
    await User.findByIdAndRemove({ _id: req.user.id });
    res.json({ msg: "User removed." });
  } catch (err) {
    console.err(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT /api/profile/experience
// @desc     Update profiles experiences..work history
// @access   Private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required.")
        .not()
        .isEmpty(),
      check("company", "Company is required.")
        .not()
        .isEmpty(),
      check("from", "From date is required.")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    // Validate the input from the front end.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //if no errors, destructure the req.body to get the information that we want to update.
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    // create an object representing the new experiences
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    // Use a try/catch block to update this new information in the database
    try {
      //Get the profile with the user.id
      const profile = await Profile.findOne({ user: req.user.id });
      // unshift addes our new information first
      profile.experience.unshift(newExp);
      // Save the new profile
      await profile.save();
      //Respond with the updated profile
      res.json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  }
);

// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    // Get the remove index and splice it off and then save the user profile
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);
    console.log("Removing this index: ", removeIndex);
    profile.experience.splice(removeIndex, 1);
    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error.");
  }
});

// @route    PUT /api/profile/education
// @desc     Update profiles education
// @access   Private
router.put(
  "/experience",
  [
    auth,
    [
      check("school", "School is required.")
        .not()
        .isEmpty(),
      check("degree", "Degree is required.")
        .not()
        .isEmpty(),
      check("fieldofstudy", "Field of study is required")
        .not()
        .isEmpty(),
      check("from", "From date is required.")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    // Validate the input from the front end.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //if no errors, destructure the req.body to get the information that we want to update.
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    // create an object representing the new experiences
    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    // Use a try/catch block to update this new information in the database
    try {
      //Get the profile with the user.id
      const profile = await Profile.findOne({ user: req.user.id });
      // unshift addes our new information first
      profile.education.unshift(newEdu);
      // Save the new profile
      await profile.save();
      //Respond with the updated profile
      res.json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  }
);

// @route    DELETE api/profile/education/:exp_id
// @desc     Delete education from profile
// @access   Private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    // Get the remove index and splice it off and then save the user profile
    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.edu_id);
    console.log("Removing this index: ", removeIndex);
    profile.education.splice(removeIndex, 1);
    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error.");
  }
});

//Export the router
module.exports = router;
