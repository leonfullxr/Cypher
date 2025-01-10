const bcryptjs = require('bcryptjs');
const UserModel = require('../models/UserModel');
const jwt = require('jsonwebtoken');

async function checkPassword(request, response){
    try {
        const {password, userId} = request.body;
        
        const user = await UserModel.findById(userId);

        if (!user) {
            return response.status(404).json({
                message: 'User not found',
                error: true,
            });
        }        

        const verifyPassword = await bcryptjs.compare(password, user.password);

        if(!verifyPassword){
            return response.status(400).json({
                message: 'Incorrect password ',
                error: true
            });
        }

        const tokenData = {
            id: user._id,
            email: user.email
        }
        const token = await jwt.sign(tokenData, process.env.JWT_SECRET, {expiresIn: '30d'});

        const cookiesOptions = {
            httpOnly: true,
            secure: true
        }

        return response.cookie('token', token, cookiesOptions).status(200).json({
            message: 'Password verified, login successful',
            token : token,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true
        });
    }

}

module.exports = checkPassword;