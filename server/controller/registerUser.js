// server/controller/registerUser.js
const UserModel = require('../models/UserModel');
const bcryptjs = require('bcryptjs');
const { ProtocolAddress } = require('@signalapp/libsignal-client');

async function registerUser(request, response) {
  try {
    const { 
      name, 
      email, 
      password, 
      profile_pic,
      signalKeys            // newly added
    } = request.body;

    const checkEmail = await UserModel.findOne({ email });
    if (checkEmail) {
      return response.status(400).json({
        message: 'Email already exists',
        error: true,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    const newUser = new UserModel({
      name,
      email,
      password: hashPassword,
      profile_pic: profile_pic || '',
      signal : signalKeys
    });
    const userSave = await newUser.save();

    return response.status(201).json({
      message: 'User registered successfully',
      data: userSave,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
}

module.exports = registerUser;
