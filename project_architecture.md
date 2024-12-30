# Project Folder Architecture
Encrypted-Chat-App/
│
├── client/                     # Frontend (Client-side) code
│   ├── public/                 # Static files (e.g., index.html, images)
│   ├── src/                    # React/Vue/Angular source code
│   │   ├── components/         # UI Components (e.g., ChatBox, MessageList)
│   │   ├── services/           # API calls and WebSocket handlers
│   │   ├── utils/              # Helper functions (e.g., encryption handling)
│   │   ├── App.js              # Main App entry point
│   │   ├── index.js            # React/Vue root rendering logic
│   │   └── styles/             # CSS/SCSS stylesheets
│   ├── package.json            # Frontend dependencies and scripts
│   └── vite.config.js          # Configuration for Vite/Webpack (build tools)
│
├── server/                     # Backend (Server-side) code
│   ├── src/                    # Source files
│   │   ├── controllers/        # API route handlers
│   │   ├── middleware/         # Express middlewares (e.g., auth, logging)
│   │   ├── models/             # Database schemas/models
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Business logic (e.g., Signal key management)
│   │   ├── utils/              # Helper functions (e.g., encryption, logging)
│   │   ├── server.js           # Main Express server setup
│   │   └── websocket.js        # WebSocket server logic
│   ├── package.json            # Backend dependencies and scripts
│   ├── .env                    # Environment variables (e.g., DB connection, keys)
│   └── README.md               # Instructions for setting up the server
│
├── database/                   # Database-related files (if applicable)
│   ├── migrations/             # Database migrations (e.g., Sequelize, Prisma)
│   ├── seeds/                  # Seed files for populating test data
│   └── db.config.js            # Configuration for database connection
│
├── shared/                     # Shared utilities/libraries (used by client & server)
│   ├── crypto/                 # Encryption and Signal Protocol handling
│   └── constants/              # Shared constants (e.g., error codes)
│
├── tests/                      # Testing files
│   ├── client/                 # Client-side tests (e.g., React Testing Library)
│   ├── server/                 # Server-side tests (e.g., Jest, Supertest)
│   └── integration/            # End-to-end tests (e.g., Cypress)
│
├── .github/                    # GitHub-specific configurations
│   ├── workflows/              # CI/CD workflows (e.g., GitHub Actions)
│   └── ISSUE_TEMPLATE.md       # Template for creating GitHub issues
│
├── Dockerfile                  # Dockerfile for containerizing the entire app
├── docker-compose.yml          # Multi-service Docker setup (client, server, database)
├── README.md                   # Main project README with setup instructions
├── LICENSE                     # License for the repository
└── .gitignore                  # Git ignore file

# Architecture Feasibility
1. Client:
	Handles local encryption/decryption with private keys.
	Manages user authentication and session tokens.
	Generates ephemeral keys for secure sessions.

2. Server:
	Acts as a relay for encrypted messages.
	Stores public keys and encrypted messages securely.
	Facilitates secure key exchange.

3. Database:
	Stores encrypted private keys, messages, and public keys.
	Uses encryption at rest and access control mechanisms.

4. Security Layer:
	Implements Signal Protocol for secure session key generation and management.
	Uses TLS for communication channels.

# Workflow
    Registration:
        User generates public/private key pair locally.
        Public key is sent to the server.
        Private key is encrypted with the master password and uploaded to the server for recovery purposes.

    Sending a Message:
        User encrypts the message using the recipient’s public key.
        Message is sent to the server via a TLS-secured connection.
        Server stores the encrypted message in the database.

    Receiving a Message:
        Recipient retrieves the encrypted message from the server.
        Message is decrypted locally using the recipient's private key.

    Key Exchange:
        Signal Protocol establishes a session key between the communicating parties.
        Session keys are used for temporary secure exchanges (e.g., acknowledgments or handshake messages).

## Workflow: Recover Device

    User Initiates Recovery:
        The user selects the "Recover Device" option in the setup menu.
        The user is prompted to enter their master password.

    Authentication with Master Password:
        The master password is used to generate a cryptographic key (via a Key Derivation Function like Argon2 or PBKDF2).
        The derived key is sent securely (over TLS) to the server to decrypt the user's private key.

    Server Retrieves and Sends Keys and Data:
        The server retrieves the encrypted private key and encrypted chat history from the database.
        The private key and chat history are decrypted on the server using the cryptographic key derived from the master password.
        The server re-encrypts the private key and chat history with a temporary session key (negotiated via Signal Protocol) and sends it to the new device.

    Device Setup:
        The new device receives the encrypted private key and chat history.
        The user’s private key and chats are stored locally, with the private key encrypted using the master password.