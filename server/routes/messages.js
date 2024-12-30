const express = require("express");
const Message = require("../models/Message");
const User = require("../models/User");

const router = express.Router();

router.post("/send", async (req, res) => {
    try {
        const { sender, recipient, content } = req.body;

        // Ensure the recipient exists
        const recipientUser = await User.findOne({ username: recipient });
        if (!recipientUser) {
            return res.status(404).json({ error: "Recipient not found" });
        }

        // Store the encrypted message
        const newMessage = new Message({ sender, recipient, content });
        await newMessage.save();

        res.status(201).json({ message: "Message sent successfully!" });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;

router.get("/receive/:username", async (req, res) => {
    try {
        const { username } = req.params;

        // Find all messages for the user
        const messages = await Message.find({ recipient: username }).sort("timestamp");
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
