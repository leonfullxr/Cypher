const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

async function authenticateJWT(req, res, next) {
  try {
    // 1. Get the token from the cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized. No token provided." });
    }

    // 2. Verify the token using your SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find the user in the database using decoded.id
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    // 4. Store user info in req.user and proceed to the next middleware
    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({ message: "Unauthorized. Invalid or expired token." });
  }
}

module.exports = authenticateJWT;
