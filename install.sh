#!/bin/bash
###############################################################################
#                            COLOR DEFINITIONS                                #
###############################################################################
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

###############################################################################
#                              CYPHER LOGO                                    #
###############################################################################
print_logo() {
  echo -e "${CYAN}"
  cat << "EOF"

 ██████╗██╗   ██╗██████╗ ██╗  ██╗███████╗██████╗ 
██╔════╝╚██╗ ██╔╝██╔══██╗██║  ██║██╔════╝██╔══██╗
██║      ╚████╔╝ ██████╔╝███████║█████╗  ██████╔╝
██║       ╚██╔╝  ██╔═══╝ ██╔══██║██╔══╝  ██╔══██╗
╚██████╗   ██║   ██║     ██║  ██║███████╗██║  ██║
 ╚═════╝   ╚═╝   ╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
                                                 
EOF
  echo -e "${NC}"
}

#######################################################################
#                          SYSTEM CHECK                               #
#######################################################################

# Enable job control so that background processes can be tracked.
set -m

#######################################################################
#                           SIGNAL HANDLING                           #
#######################################################################
cleanup() {
  echo -e "\n\n${YELLOW}⚠️  Caught interrupt signal. Cleaning up processes on specified ports...${NC}"

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
  echo -e "${GREEN}Cleanup complete. Exiting now.${NC}"
  exit 0
}

# Register the cleanup function for SIGINT (Ctrl+C) and SIGTERM.
trap cleanup SIGINT SIGTERM

############################################################
# Function to check if a command exists (and install if not)
############################################################
check_command() {
  echo -e "\n------------------------------------------------------------"
  echo -e "${CYAN} Checking: $1${NC}"
  echo -e "------------------------------------------------------------"
  if ! command -v "$1" &> /dev/null; then
    echo -e "${RED}❌ $1 is not installed. Installing...${NC}"
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
      sudo apt-get update
      sudo apt-get install -y "$1"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
      brew install "$1"
    else
      echo -e "${RED}Unsupported OS. Please install $1 manually.${NC}"
      exit 1
    fi
  else
    echo -e "${GREEN}✅ $1 is already installed.${NC}"
  fi
  echo -e "------------------------------------------------------------\n"
}

# Check if a port is in use
is_port_in_use() {
  local port=$1
  # The ss command lists listening ports; grep for ":port " to detect usage.
  if ss -tlpn 2>/dev/null | grep -q ":$port "; then
    return 0  # Port is in use.
  else
    return 1  # Port is free.
  fi
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

# Perform environment checks: Node/npm, directories, prompt for ports, update env
environment_setup() {
  echo -e "${YELLOW}\n=============================================="
  echo -e " ENVIRONMENT & PROJECT SETUP"
  echo -e "==============================================${NC}"

  echo -e "${CYAN}# Checking Node.js installation...${NC}"
  check_command node

  echo -e "${CYAN}# Checking npm installation...${NC}"
  check_command npm

  echo -e "\n${CYAN}# Validating project structure...${NC}"
  if [[ ! -d "server" || ! -d "client" ]]; then
    echo -e "${RED}❌ 'server' and/or 'client' directory is missing.${NC}"
    echo -e "${YELLOW}⚠️  Please re-clone the repository to ensure all files are present.${NC}"
    echo -e "${RED}🚨 Exiting script.${NC}"
    exit 1
  else
    echo -e "${GREEN}✅ Required directories found. Proceeding...${NC}"
  fi

  # Ask the user for the client port
  DEFAULT_PORT_FRONTEND=9999
  echo -e "\n${CYAN}# Setting up Client Port${NC}"
  while true; do
    read -p "Enter the port for the client (default is $DEFAULT_PORT_FRONTEND): " input
    if [[ -z "$input" ]]; then
      CLIENT_PORT="$DEFAULT_PORT_FRONTEND"
    else
      CLIENT_PORT="$input"
    fi
    if ! [[ "$CLIENT_PORT" =~ ^[0-9]+$ ]]; then
      echo -e "${RED}❌ Port must be a number. Try again.${NC}"
      continue
    fi
    if (( CLIENT_PORT < 1024 || CLIENT_PORT > 65535 )); then
      echo -e "${RED}❌ Invalid port. Must be between 1024 and 65535.${NC}"
      continue
    fi
    if is_port_in_use "$CLIENT_PORT"; then
      echo -e "${RED}❌ Port $CLIENT_PORT is in use. Choose another.${NC}"
      continue
    fi
    break
  done
  echo -e "${GREEN}✅ Client port set to: $CLIENT_PORT${NC}"

  # Ask the user for the server port (cannot be the same as client)
  DEFAULT_PORT_BACKEND=9996
  echo -e "\n${CYAN}# Setting up Server Port${NC}"
  while true; do
    read -p "Enter the port for the server (default is $DEFAULT_PORT_BACKEND): " input
    if [[ -z "$input" ]]; then
      if (( CLIENT_PORT == DEFAULT_PORT_BACKEND )); then
        echo -e "${RED}❌ Server port can't match client port. Choose another.${NC}"
        continue
      fi
      SERVER_PORT="$DEFAULT_PORT_BACKEND"
    else
      if (( CLIENT_PORT == input )); then
        echo -e "${RED}❌ Server port can't match client port. Choose another.${NC}"
        continue
      fi
      SERVER_PORT="$input"
    fi
    if ! [[ "$SERVER_PORT" =~ ^[0-9]+$ ]]; then
      echo -e "${RED}❌ Port must be a number. Try again.${NC}"
      continue
    fi
    if (( SERVER_PORT < 1024 || SERVER_PORT > 65535 )); then
      echo -e "${RED}❌ Invalid port. Must be between 1024 and 65535.${NC}"
      continue
    fi
    if is_port_in_use "$SERVER_PORT"; then
      echo -e "${RED}❌ Port $SERVER_PORT is in use. Choose another.${NC}"
      continue
    fi
    break
  done
  echo -e "${GREEN}✅ Server port set to: $SERVER_PORT${NC}\n"

  # Update .env in the client directory
  local CLIENT_ENV_FILE="./client/.env"
  echo -e "${CYAN}# Updating client .env...${NC}"
  if [[ -f $CLIENT_ENV_FILE ]]; then
    echo "Updating existing $CLIENT_ENV_FILE..."
    sed -i.bak "/^BACKEND_PORT=/c\BACKEND_PORT=$SERVER_PORT" "$CLIENT_ENV_FILE"
    sed -i.bak "/^REACT_APP_BACKEND_URL=/c\REACT_APP_BACKEND_URL=http://localhost:$SERVER_PORT" "$CLIENT_ENV_FILE"
    sed -i.bak "/^FRONTEND_PORT=/c\FRONTEND_PORT=$CLIENT_PORT" "$CLIENT_ENV_FILE"
    sed -i.bak "/^REACT_APP_FRONTEND_URL=/c\REACT_APP_FRONTEND_URL=http://localhost:$CLIENT_PORT" "$CLIENT_ENV_FILE"
    sed -i.bak "/^PORT=/c\PORT=$CLIENT_PORT" "$CLIENT_ENV_FILE"
    echo -e "${GREEN}✅ Updated existing client .env${NC}"
  else
    echo "Creating new $CLIENT_ENV_FILE..."
    {
      echo "REACT_APP_CLOUDINARY_CLOUD_NAME=<ask_admin>"
      echo "BACKEND_PORT=$SERVER_PORT"
      echo "REACT_APP_BACKEND_URL=http://localhost:$SERVER_PORT"
      echo "FRONTEND_PORT=$CLIENT_PORT"
      echo "REACT_APP_FRONTEND_URL=http://localhost:$CLIENT_PORT"
      echo "PORT=$CLIENT_PORT"
    } > "$CLIENT_ENV_FILE"
    echo -e "${GREEN}✅ Created and updated client .env${NC}"
  fi

  # Update .env in the server directory
  local SERVER_ENV_FILE="./server/.env"
  echo -e "\n${CYAN}# Updating server .env...${NC}"
  if [[ -f $SERVER_ENV_FILE ]]; then
    echo "Updating existing $SERVER_ENV_FILE..."
    sed -i.bak "/^PORT=/c\PORT=$SERVER_PORT" "$SERVER_ENV_FILE"
    sed -i.bak "/^FRONTEND_URL=/c\FRONTEND_URL=http://localhost:$CLIENT_PORT" "$SERVER_ENV_FILE"
    echo -e "${GREEN}✅ Updated existing server .env${NC}"
  else
    echo "Creating new $SERVER_ENV_FILE..."
    {
      echo "PORT=$SERVER_PORT"
      echo "FRONTEND_URL=http://localhost:$CLIENT_PORT"
      echo "MONGO_URL=<ask_admin>"
      echo "JWT_SECRET=abcdedfghijklmnopqrstuvwxyz"
    } > "$SERVER_ENV_FILE"
    echo -e "${GREEN}✅ Created and updated server .env${NC}"
  fi

  echo -e "\n${GREEN}✅ Environment setup completed successfully.${NC}\n"
}

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
  echo -e "${CYAN} Navigating to: $dir${NC}"
  echo -e "------------------------------------------------------------"
  cd "$dir" || { echo -e "${RED}❌ Directory $dir not found. Exiting.${NC}"; exit 1; }

  echo -e "${CYAN}Installing dependencies...${NC}"
  npm install

  echo -e "${CYAN}Starting service with command: $command${NC}"
  # Start in the background
  $command &

  cd - &> /dev/null || exit 1
}

install_and_start() {
  echo -e "${YELLOW}\n=============================================="
  echo -e " INSTALLING DEPENDENCIES & STARTING SERVICES"
  echo -e "==============================================${NC}"

  echo -e "${CYAN}>>> Starting server...${NC}"
  # Example: If your server uses `node index.js` or `npm run dev`
  start_project "server" "node index.js"

  echo -e "${CYAN}>>> Starting client...${NC}"
  start_project "client" "npm start"

  echo -e "\n${GREEN}🎉 Setup complete! Your project should be running. 🚀${NC}"
  echo -e "Press Ctrl+C to stop both services and free their ports.\n"
}

###############################################################################
#                                   MENU                                      #
###############################################################################
show_menu() {
  while true; do
    echo -e "${BLUE}============================================================"
    echo -e "                          MAIN MENU"
    echo -e "============================================================${NC}"
    echo -e "${CYAN}1) Environment & Project Setup (Node/npm checks, .env updates)"
    echo -e "2) Install Dependencies & Start Services"
    echo -e "3) Exit"
    echo -e "${NC}"
    read -rp "Select an option (1/2/3): " choice

    case "$choice" in
      1)
        environment_setup
        ;;
      2)
        install_and_start
        ;;
      3)
        echo -e "${YELLOW}Exiting script...${NC}"
        exit 0
        ;;
      *)
        echo -e "${RED}Invalid choice. Please select 1, 2, or 3.${NC}"
        ;;
    esac

    echo ""
  done
}

###############################################################################
#                                   MAIN                                      #
###############################################################################
main() {
  clear
  print_logo
  show_menu
  # After user picks from the menu, we drop into `wait` so trap remains active
  wait
}

main