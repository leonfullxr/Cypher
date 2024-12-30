const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

// Initialize environment variables
dotenv.config();

// Initialize app
const app = express();

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Basic route for testing
app.get("/", (req, res) => {
    res.send("Server is running!");
});

app.post("/api/test", (req, res) => {
    const { message } = req.body;
    res.json({ reply: `Server received: ${message}` });
});


// Start server
const PORT = process.env.PORT || 9999;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
