// Bring in jwt
const jwt = require("jsonwebtoken");
// We need access to the secret in the config file, so we need config
const config = require("config");

// Export the middleware function, middleware is just a function that has access to the req, res. Next is a callback.
module.exports = function(req, res, next) {
  //Get the token from the header
  const token = req.header("x-auth-token");
  // Check if no token exists
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization failed." });
  }
  // Verify the token
  try {
    // decode the token with jwt.verify
    const decoded = jwt.verify(token, config.get("jwtSecret"));

    // Take the request object and assign a value to the user
    req.user = decoded.user;

    // Call next to move along the middleware
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid." });
  }
};
