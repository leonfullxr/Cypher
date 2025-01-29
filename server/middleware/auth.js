// middleware/auth.js
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

async function authenticateJWT(req, res, next) {
  try {
    // 1. Tomar el token de la cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized. No token provided."});
    }

    // 2. Verificar el token con tu SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Buscar al usuario en la DB a partir de decoded.id (o lo que guardes en tokenData)
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized. User not found."});
    }

    // 4. Guardar info en req.user y pasar al siguiente middleware
    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({ message: "Unauthorized. Invalid or expired token." });
  }
}

module.exports = authenticateJWT;