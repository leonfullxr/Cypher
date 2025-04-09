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
        required: function () {
            // Only require password if user is not signing in with Google
            return !this.googleId;
          },
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
    isMfaActive: {
        type: Boolean,
        required: false,
    },
    twoFactorSecret: {
        type: String,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
}, { 
    timestamps: true 
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;