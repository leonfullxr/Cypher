const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");

dotenv.config(); // Load environment variables

const app = express(); // Initialize the Express app

// Middleware
const messageRoutes = require("./routes/messages");
app.use("/api/messages", messageRoutes);
app.use(bodyParser.json());
app.use(express.json()); // Optional: Alternative for parsing JSON payloads

// MongoDB connection
console.log("MongoDB URI:", process.env.MONGO_URI); // Debug MongoDB URI
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Create the HTTP server
const server = http.createServer(app);

// Start server
const PORT = 9999;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
