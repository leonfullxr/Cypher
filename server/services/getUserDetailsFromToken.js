const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

const getUserDetailsFromToken = async (token) => {
    if(!token){
        return {
            message : 'No token provided',
            logout: true
        }
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findById(decoded.id).select('-password');

    return user;
}

module.exports = getUserDetailsFromToken;