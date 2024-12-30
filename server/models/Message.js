const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    sender: { type: String, required: true }, // Username of the sender
    recipient: { type: String, required: true }, // Username of the recipient
    content: { type: String, required: true }, // Encrypted message content
    timestamp: { type: Date, default: Date.now }, // Time of sending
});

module.exports = mongoose.model("Message", MessageSchema);
