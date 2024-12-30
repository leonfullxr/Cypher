const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { username, masterPassword } = req.body;

        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Validate the master password
        const [hashedPassword, encryptedPrivateKey] = user.privateKey.split(":");
        const isPasswordValid = await bcrypt.compare(masterPassword, hashedPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid master password" });
        }

        // Return user data and encrypted private key
        res.status(200).json({
            username: user.username,
            publicKey: user.publicKey,
            encryptedPrivateKey,
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
