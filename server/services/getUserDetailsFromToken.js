const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

const getUserDetailsFromToken = async (token) => {
    if (!token) {
        return {
            message: 'No token provided',
            logout: true,
        };
    }

    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);

        const user = await UserModel.findById(decoded.id).select('-password');

        return user;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return {
                message: 'Token has expired',
                logout: true,
            };
        }

        return {
            message: 'Invalid token',
            logout: true,
        };
    }
};

module.exports = getUserDetailsFromToken;
