import React, { useEffect, useState } from "react";
import axios from "axios";

const ReceiveMessages = () => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await axios.get("http://localhost:9999/api/messages/receive/testUser"); // Replace with logged-in username
                setMessages(res.data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();
    }, []);

    return (
        <div>
            <h2>Received Messages</h2>
            {messages.map((msg, idx) => (
                <div key={idx}>
                    <p><strong>From:</strong> {msg.sender}</p>
                    <p><strong>Message:</strong> {msg.content}</p>
                    <p><small>{new Date(msg.timestamp).toLocaleString()}</small></p>
                </div>
            ))}
        </div>
    );
};

export default ReceiveMessages;
