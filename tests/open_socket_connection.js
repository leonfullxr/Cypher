#!/usr/bin/env node
const io = require("socket.io-client");

// Replace with your server URL and port
const SERVER_URL = "http://localhost:9996";

// Optionally, pass an authentication token if required by your server
const socket = io(SERVER_URL, {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3OWJiZDhkODE5NWJlNWExMzA2OTc5OCIsImVtYWlsIjoidGFydGFyaWFAZ21haWwuY29tIiwiaWF0IjoxNzQ0MjE0NzI0LCJleHAiOjE3NDY4MDY3MjR9.09mxQgr4cXV81QnDuBJrqdcfUEVeMkQJUoFy2rmDl5M"
  }
});

socket.on("connect", () => {
  console.log("Connected to the server with ID:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});

// Keep the connection open
process.stdin.resume();
