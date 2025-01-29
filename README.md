# Cypher

## Description
Cypher is a cutting-edge encrypted chat application designed to prioritize user privacy and security. With end-to-end encryption, your messages remain confidential and secure, ensuring peace of mind in your communications. We don't store any IP addresses, metadata or user-linked data; it is perfectly anonymous.

---

## Features
- **End-to-End Encryption**: Messages are encrypted from sender to receiver, safeguarding your data from prying eyes. Every message stored on the database is encrypted and cannot be read even if the database is breached.
- **Real-Time Messaging**: Fast and seamless chat experience.
- **Cross-Platform Support**: Accessible on multiple devices for convenient communication.
- **NO Metadata Storage**: Prioritizes privacy by storing zero user metadata.

---

## Registration Process
Upon user registration, the following occurs:
1. The client **generates a 2048-bit RSA key pair** (public and private key).
2. The client **encrypts the private key** with the user's master password.
3. The client **sends the registration data** (username, public key, and encrypted private key) to the server.
4. The server **stores the information in MongoDB**.
5. The server **acknowledges the successful registration** and redirects the client to the login page.

---

## Architecture Description
1. **Client Side**
   - **User Interface (UI)**: Allows users to send/receive messages and manage contacts.
   - **Local Key Management**: Generates and stores private keys encrypted with the master password.
   - **Encryption Module**: Encrypts outgoing messages using the recipient's public key and decrypts incoming messages with the user's private key.

2. **Server Side**
   - **Authentication Module**:
     - Handles user login with the master password.
     - Validates identity and grants access to stored data.
   - **Database Connection**: Stores users' data securely in MongoDB.
   - **Message Queue**: Stores encrypted messages so that they are retrieved by the recipient.
   - **Key Exchange Service**: Sends user's public key for ensuring message encryption.

3. **Database**
   - Stores **public keys**.
   - Stores **encrypted messages** (encrypted with recipient’s public key).
   - Stores **encrypted private keys** (encrypted with master passwords).

---

## Frameworks & APIs
### **Database: MongoDB**
- We use **MongoDB Atlas** as our cloud-hosted database.
- The backend interacts with MongoDB through the **Mongoose** library for structured data modeling.

### **Media Storage: Cloudinary**
- To store images and videos, we use **Cloudinary**.
- It provides secure cloud-based storage and delivers media via **HTTPS links**.

### **Real-Time Communication: Socket.io**
- We use **Socket.io** to facilitate **real-time communication** between the client and server.
- This enables **instant message delivery** and **live updates**.

---

## Project Folder Structure
```
Encrypted-Chat-App/
│
├── client/                     # Frontend (Client-side) code
│   ├── public/                 # Static files (e.g., index.html, images, icons, manifest)
│   ├── src/                    # React source code
│   │   ├── assets/             # UI assets (logos, backgrounds)
│   │   ├── components/         # UI Components (e.g., ChatBox, MessageList, SearchUser)
│   │   ├── layout/             # Layout-related components
│   │   ├── pages/              # Application pages (Home, Register, ForgotPassword)
│   │   ├── redux/              # Redux store and user management
│   │   ├── routes/             # Route definitions
│   │   ├── services/           # API calls and WebSocket handlers
│   │   ├── utils/              # Helper functions (e.g., encryption handling, file uploads)
│   │   ├── App.js              # Main App entry point
│   │   ├── index.js            # React root rendering logic
│   │   ├── index.css           # Global styles
│   │   └── tailwind.config.js  # Tailwind CSS configuration
│   ├── package.json            # Frontend dependencies and scripts
│   ├── package-lock.json       # Package lock file
│   ├── .env                    # Environment variables
│   ├── .gitignore              # Git ignore rules
│   └── README.md               # Client documentation
│
├── server/                     # Backend (Server-side) code
│   ├── config/                 # Configuration files (e.g., DB connection)
│   ├── controller/             # API route handlers (auth, search, user management)
│   ├── models/                 # Database schemas/models (User, Conversation)
│   ├── routes/                 # API route definitions
│   ├── services/               # Business logic (e.g., conversation retrieval, token management)
│   ├── socket/                 # WebSocket implementation for real-time messaging
│   ├── .env                    # Environment variables
│   ├── .gitignore              # Git ignore rules
│   ├── docker-compose.yml      # Docker setup for backend services
│   ├── index.js                # Main Express server setup
│   ├── package.json            # Backend dependencies and scripts
│   ├── package-lock.json       # Package lock file
│   ├── README.md               # Server documentation
│   └── Dockerfile              # Docker container configuration
│
├── install.sh                  # Installation script for automated setup
├── LICENSE                     # License file
├── project_architecture.md      # Documentation of project architecture
├── README.md                   # Main project README with setup instructions
├── .git/                        # Git repository metadata
├── .gitignore                   # Git ignore rules
├── docker-compose.yml           # Multi-service Docker setup (client, server, database)
└── details/                     # Additional documentation or setup files
```

---

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/leonfullxr/Cypher.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Cypher
   ```
3. Install dependencies and start the server:
   ```bash
   cd server
   npm install
   npm run dev
   ```
4. Start the client:
   ```bash
   cd ../client
   npm install
   npm start
   ```
Alternatively, you can use the provided `install.sh` script:
```bash
./install.sh
```

---

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact
For inquiries or support, reach out to us at [admin@leonfuller.space](mailto:admin@leonfuller.space).

