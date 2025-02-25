#!/bin/bash

#######################################################################
#                          SYSTEM CHECK                               #
#######################################################################

# Enable job control so that background processes can be tracked.
set -m

#######################################################################
#                           SIGNAL HANDLING                           #
#######################################################################
cleanup() {
  echo -e "\n\n⚠️  Caught interrupt signal. Cleaning up listening processes on specified ports..."

  # Cleanup for CLIENT_PORT
  if [ -n "$CLIENT_PORT" ]; then
    client_pids=$(lsof -nP -iTCP:$CLIENT_PORT -sTCP:LISTEN -t)
    if [ -n "$client_pids" ]; then
      echo "Sending SIGTERM to listening processes on port $CLIENT_PORT: $client_pids"
      kill $client_pids
      sleep 2
      # Check if still alive, then force kill.
      client_pids=$(lsof -nP -iTCP:$CLIENT_PORT -sTCP:LISTEN -t)
      if [ -n "$client_pids" ]; then
        echo "Force killing remaining processes on port $CLIENT_PORT: $client_pids"
        kill -9 $client_pids
      fi
    fi
  fi

  # Cleanup for SERVER_PORT
  if [ -n "$SERVER_PORT" ]; then
    server_pids=$(lsof -nP -iTCP:$SERVER_PORT -sTCP:LISTEN -t)
    if [ -n "$server_pids" ]; then
      echo "Sending SIGTERM to listening processes on port $SERVER_PORT: $server_pids"
      kill $server_pids
      sleep 2
      # Check if still alive, then force kill.
      server_pids=$(lsof -nP -iTCP:$SERVER_PORT -sTCP:LISTEN -t)
      if [ -n "$server_pids" ]; then
        echo "Force killing remaining processes on port $SERVER_PORT: $server_pids"
        kill -9 $server_pids
      fi
    fi
  fi

  # Exit with success status so that the error message is not reported by the script.
  exit 0
}

# Register the cleanup function for SIGINT (Ctrl+C) and SIGTERM.
trap cleanup SIGINT SIGTERM

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
# Function to check if a port is in use
############################################################
is_port_in_use() {
  local port=$1
  # The ss command lists all listening ports; grep for ":port " to check usage.
  if ss -tlpn 2>/dev/null | grep -q ":$port "; then
    return 0  # Port is in use.
  else
    return 1  # Port is free.
  fi
}

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
  if is_port_in_use "$CLIENT_PORT"; then
    echo "❌ Port $CLIENT_PORT is already in use. Please choose a different port."
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
  if is_port_in_use "$SERVER_PORT"; then
    echo "❌ Port $SERVER_PORT is already in use. Please choose a different port."
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
  sed -i.bak "/^PORT=/c\PORT=$CLIENT_PORT" "$ENV_FILE"
else
  echo "Creating $ENV_FILE with updated values..."
  {
    echo "REACT_APP_CLOUDINARY_CLOUD_NAME=<ask_admin>"
    echo "BACKEND_PORT=$SERVER_PORT"
    echo "REACT_APP_BACKEND_URL=http://localhost:$SERVER_PORT"
    echo "FRONTEND_PORT=$CLIENT_PORT"
    echo "REACT_APP_FRONTEND_URL=http://localhost:$CLIENT_PORT"
    echo "PORT=${CLIENT_PORT}"
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
  # Start in the background and capture its PID
  $command &

  # Go back to the parent after starting
  cd - &> /dev/null || exit 1
}

echo ">>> Starting server..."
start_project "server" "node index.js"

echo ">>> Starting client..."
start_project "client" "npm start"

echo -e "\n🎉 Setup complete! Your project is running successfully! 🚀\n"
echo "Press Ctrl+C to stop both services and free their ports."

# Wait for all background processes so that the trap remains active.
wait