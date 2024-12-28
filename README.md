# Cypher
## Description
Cypher is a cutting-edge encrypted chat application designed to prioritize user privacy and security. With end-to-end encryption, your messages remain confidential and secure, ensuring peace of mind in your communications. We don't store any IP addresses, metadata or user linked data, it is perfectly anonymous.

---

## Features
- **End-to-End Encryption**: Messages are encrypted from sender to receiver, safeguarding your data from prying eyes. Every message stored on the database is encrypted and cannot be read even if the database is breached.
- **Real-Time Messaging**: Fast and seamless chat experience.
- **Cross-Platform Support**: Accessible on multiple devices for convenient communication.
- **Secure Group Chats**: Encrypt conversations with multiple participants.
- **NO Metadata Storage**: Prioritizes privacy by storing zero user metadata.

---

## Architecture Description
1. Client Side

   1. User Interface (UI): Allows users to send/receive messages and manage contacts.
   2. Local Key Management: Generates and stores private keys encrypted with the master password.
   3. Encryption Module: Encrypts outgoing messages using the recipient's public key and decrypts incoming messages with the user's private key.
   4. TLS Layer: Ensures transport security between client and server.

2. Server Side

   1. Authentication Module:
      1. Handles user login with master password.
      2. Validates identity and grants access to stored data.
   2. Public Key Store: Stores users' public keys securely.
   3. Message Queue: Temporarily stores encrypted messages until they are retrieved by the recipient.
   4. Key Exchange Service: Implements Signal Protocol for secure session key negotiation.
   5. Database: Stores:
      1. Public keys.
      2. Encrypted messages (encrypted with recipient’s public key).
      3. Encrypted private keys (encrypted with master passwords).

3. Database
   1. Encrypted storage using AES encryption for all data at rest.
   2. Strict access control policies.

4. Communication Protocol
   1. TLS: Protects communication between the client and server.
   2. Signal Protocol: Provides session key exchange and ensures forward secrecy.

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

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the application:
   ```bash
   npm start
   ```

---

## Usage
- Open the application on your device.
- Create an account or log in with your credentials.
- Start secure conversations with your contacts.

---

## Contributing
We welcome contributions from the community! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature description"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request and describe your changes.

---

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact
For inquiries or support, reach out to us at [admin@leonfuller.space](mailto:admin@leonfuller.space).

