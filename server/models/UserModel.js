const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password']
    },
    profile_pic: {
        type: String,
        default: ''
    },
    publicKey: {
        type: String,
        required: [true, 'Public key is required']
    },
    encryptedPrivateKey: {
        type: String,
        required: [true, 'Encrypted private key is required']
    },
}, { 
    timestamps: true 
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;