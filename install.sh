#!/bin/bash

#######################################################################
#                          SYSTEM CHECK                               #
#######################################################################

echo -e "# Checking System Requirements                              #"

############################################################
# Function to check if a command exists (and install if not)
############################################################
check_command() {
  echo -e "\n------------------------------------------------------------"
  echo -e " Checking: $1"
  echo -e "------------------------------------------------------------"
  if ! command -v "$1" &> /dev/null; then
    echo -e "❌ $1 is not installed. Installing..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
      sudo apt-get update
      sudo apt-get install -y "$1"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
      brew install "$1"
    else
      echo "Unsupported OS. Please install $1 manually."
      exit 1
    fi
  else
    echo -e "✅ $1 is already installed."
  fi
  echo -e "------------------------------------------------------------\n"
}

############################################################
# Check if Node.js is installed
############################################################
echo -e "# Checking Node.js installation                            #"
check_command node

############################################################
# Check if npm is installed
############################################################
echo -e "# Checking npm installation                               #"
check_command npm

############################################################
# Check if 'server' and 'client' directories exist
############################################################
echo -e "\n############################################################"
echo -e "# Validating Project Structure                           #"
echo -e "############################################################\n"
if [[ ! -d "server" || ! -d "client" ]]; then
  echo -e "❌ The required directories 'server' and/or 'client' are missing."
  echo -e "⚠️  Please re-clone the repository to ensure all files are present."
  echo -e "🚨 Exiting script."
  exit 1
else
  echo -e "✅ Required directories found. Proceeding..."
fi

############################################################
# Ask the user for the client port
############################################################
DEFAULT_PORT_FRONTEND=9999
echo -e "\n############################################################"
echo -e "# Setting up Client Port                                  #"
echo -e "############################################################\n"
while true; do
  read -p "Enter the port for the client (default is $DEFAULT_PORT_FRONTEND): " input
  if [[ -z "$input" ]]; then
    CLIENT_PORT="$DEFAULT_PORT_FRONTEND"
  else
    CLIENT_PORT="$input"
  fi
  if ! [[ "$CLIENT_PORT" =~ ^[0-9]+$ ]]; then
    echo "❌ Port must be a number. Please try again."
    continue
  fi
  if (( CLIENT_PORT < 1024 || CLIENT_PORT > 65535 )); then
    echo "❌ Invalid port number. Please enter a port between 1024 and 65535."
    continue
  fi
  break
done
echo -e "✅ Client port set to: $CLIENT_PORT\n"

############################################################
# Ask the user for the server port (can't be the same as client)
############################################################
DEFAULT_PORT_BACKEND=9996
echo -e "\n############################################################"
echo -e "# Setting up Server Port                                  #"
echo -e "############################################################\n"
while true; do
  read -p "Enter the port for the server (default is $DEFAULT_PORT_BACKEND): " input
  if [[ -z "$input" ]]; then
    if (( CLIENT_PORT == DEFAULT_PORT_BACKEND )); then
      echo "❌ Server port can't be the same as client port. Choose a different port."
      continue
    fi
    SERVER_PORT="$DEFAULT_PORT_BACKEND"
  else
    if (( CLIENT_PORT == input )); then
      echo "❌ Server port can't be the same as client port. Choose a different port."
      continue
    fi
    SERVER_PORT="$input"
  fi
  if ! [[ "$SERVER_PORT" =~ ^[0-9]+$ ]]; then
    echo "❌ Port must be a number. Please try again."
    continue
  fi
  if (( SERVER_PORT < 1024 || SERVER_PORT > 65535 )); then
    echo "❌ Invalid port number. Please enter a port between 1024 and 65535."
    continue
  fi
  break
done
echo -e "✅ Server port set to: $SERVER_PORT\n"

############################################################
# Update the .env file in the client directory
############################################################
ENV_FILE="./client/.env"
if [[ -f $ENV_FILE ]]; then
  echo "Updating SERVER and CLIENT PORTS in $ENV_FILE..."
  sed -i.bak "/^BACKEND_PORT=/c\BACKEND_PORT=$SERVER_PORT" "$ENV_FILE"
  sed -i.bak "/^REACT_APP_BACKEND_URL=/c\REACT_APP_BACKEND_URL=http://localhost:$SERVER_PORT" "$ENV_FILE"
  sed -i.bak "/^FRONTEND_PORT=/c\FRONTEND_PORT=$CLIENT_PORT" "$ENV_FILE"
  sed -i.bak "/^REACT_APP_FRONTEND_URL=/c\REACT_APP_FRONTEND_URL=http://localhost:$CLIENT_PORT" "$ENV_FILE"
else
  echo "Creating $ENV_FILE with updated values..."
  {
    echo "REACT_APP_CLOUDINARY_CLOUD_NAME=<ask_admin>"
    echo "BACKEND_PORT=$SERVER_PORT"
    echo "REACT_APP_BACKEND_URL=http://localhost:$SERVER_PORT"
    echo "FRONTEND_PORT=$CLIENT_PORT"
    echo "REACT_APP_FRONTEND_URL=http://localhost:$CLIENT_PORT"
  } > "$ENV_FILE"
fi

############################################################
# Update the .env file in the server directory
############################################################
ENV_FILE="./server/.env"
if [[ -f $ENV_FILE ]]; then
  echo "Updating SERVER PORT in $ENV_FILE..."
  sed -i.bak "/^PORT=/c\PORT=$SERVER_PORT" "$ENV_FILE"
  sed -i.bak "/^FRONTEND_URL=/c\FRONTEND_URL=http://localhost:$CLIENT_PORT" "$ENV_FILE"
else
  echo "Creating $ENV_FILE with updated values..."
  {
    echo "PORT=$SERVER_PORT"
    echo "FRONTEND_URL=http://localhost:$CLIENT_PORT"
    echo "MONGO_URL=<ask_admin>"
    echo "JWT_SECRET=abcdedfghijklmnopqrstuvwxyz"
  } > "$ENV_FILE"
fi

############################################################
# Installing dependencies & starting services
############################################################
echo -e "\n############################################################"
echo -e "# Installing Dependencies & Starting Services            #"
echo -e "############################################################\n"

start_project() {
  local dir="$1"
  local command="$2"
  echo -e "\n------------------------------------------------------------"
  echo -e " Navigating to: $dir"
  echo -e "------------------------------------------------------------"
  cd "$dir" || { echo "❌ Directory not found. Exiting."; exit 1; }

  echo -e "Installing dependencies..."
  npm install

  echo -e "Starting service with command: $command"
  # Start in the background
  $command &

  # Go back to the parent after starting
  cd - &> /dev/null || exit 1
}

echo ">>> Starting server..."
start_project "server" "nodemon index.js"
echo ">>> Starting client..."
start_project "client" "npm start"

echo -e "\n🎉 Setup complete! Your project is running successfully! 🚀\n"
