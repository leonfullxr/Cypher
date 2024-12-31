const UserModel = require('../models/UserModel');
const bcryptjs = require('bcryptjs');

async function registerUser(request, response){
    try {
        const {name, email, password, profile_pic} = request.body;
        
        const checkEmail = await UserModel.findOne({email});

        if(checkEmail){
            return response.status(400).json({
                message: 'Email already exists',
                error: true
            });
        }

        //password into hashpassword
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        const newUser = new UserModel({
            name,
            email,
            password: hashPassword,
            profile_pic
        });
        const userSave = await newUser.save();

        return response.status(201).json({
            message: 'User registered successfully',
            data : userSave,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = registerUser;