const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    publicKey: { type: String, required: true }, // Public key for encryption
    privateKey: { type: String, required: true }, // Encrypted private key
});

module.exports = mongoose.model("User", UserSchema);
