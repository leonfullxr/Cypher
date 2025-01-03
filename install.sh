#!/bin/bash

# Navigate to the server directory
echo "Navigating to the server directory..."
cd server

# Install server dependencies
echo "Installing server dependencies..."
npm install

# Start the server
echo "Starting the server..."
npm run dev &

# Navigate to the client directory
echo "Navigating to the client directory..."
cd ../client

# Install client dependencies
echo "Installing client dependencies..."
npm install

# Start the client
echo "Starting the client..."
npm start