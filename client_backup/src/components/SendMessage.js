import React, { useState } from "react";
import { useContext } from "react";
import SocketContext from "./SocketContext";

const SendMessage = () => {
    const [recipient, setRecipient] = useState("");
    const [message, setMessage] = useState("");
    const socket = useContext(SocketContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const encryptedMessage = `Encrypted(${message})`;
        socket.emit("sendMessage", { sender: "testUser", recipient, content: encryptedMessage });
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
