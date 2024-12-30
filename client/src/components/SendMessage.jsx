import React, { useState } from "react";
import axios from "axios";

const SendMessage = () => {
    const [recipient, setRecipient] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Encrypt the message (placeholder logic)
            const encryptedMessage = `Encrypted(${message})`;

            await axios.post("http://localhost:9999/api/messages/send", {
                sender: "testUser", // Replace with logged-in username
                recipient,
                content: encryptedMessage,
            });

            alert("Message sent!");
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
            />
            <textarea
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            <button type="submit">Send</button>
        </form>
    );
};

export default SendMessage;
