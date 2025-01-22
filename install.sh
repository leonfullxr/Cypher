#!/bin/bash

# Function to check if a command exists
check_command() {
  if ! command -v $1 &> /dev/null; then
    echo "$1 is not installed. Installing..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
      sudo apt-get update
      sudo apt-get install -y $1
    elif [[ "$OSTYPE" == "darwin"* ]]; then
      brew install $1
    else
      echo "Unsupported OS. Please install $1 manually."
      exit 1
    fi
  else
    echo "$1 is already installed."
  fi
}

# Check if Node.js is installed
echo "Checking Node.js installation..."
check_command node

# Check if npm is installed
echo "Checking npm installation..."
check_command npm

# Ask the user for the client port
DEFAULT_PORT=9999
echo "Enter the port for the client (default is $DEFAULT_PORT):"
read -r CLIENT_PORT
CLIENT_PORT=${CLIENT_PORT:-$DEFAULT_PORT}

# Modify the .env file in the client directory
ENV_FILE="./client/.env"
if [[ -f $ENV_FILE ]]; then
  echo "Updating FRONTEND_PORT and REACT_APP_FRONTEND_URL in $ENV_FILE..."
  sed -i.bak "/^FRONTEND_PORT=/c\FRONTEND_PORT=$CLIENT_PORT" $ENV_FILE
  sed -i.bak "/^REACT_APP_FRONTEND_URL=/c\REACT_APP_FRONTEND_URL=http://localhost:$CLIENT_PORT" $ENV_FILE
else
  echo "Creating $ENV_FILE with updated values..."
  echo "REACT_APP_CLOUDINARY_CLOUD_NAME=<ask_admin>" > $ENV_FILE
  echo "BACKEND_PORT=9996" >> $ENV_FILE
  echo "REACT_APP_BACKEND_URL=http://localhost:\${BACKEND_PORT}" >> $ENV_FILE
  echo "FRONTEND_PORT=$CLIENT_PORT" >> $ENV_FILE
  echo "REACT_APP_FRONTEND_URL=http://localhost:$CLIENT_PORT" >> $ENV_FILE
fi

# Navigate to the server directory
echo "Navigating to the server directory..."
cd server || { echo "Server directory not found. Exiting."; exit 1; }

# Install server dependencies
echo "Installing server dependencies..."
npm install

# Start the server
echo "Starting the server..."
npm run dev &

# Navigate to the client directory
echo "Navigating to the client directory..."
cd ../client || { echo "Client directory not found. Exiting."; exit 1; }

# Install client dependencies
echo "Installing client dependencies..."
npm install

# Start the client
echo "Starting the client..."
npm start
