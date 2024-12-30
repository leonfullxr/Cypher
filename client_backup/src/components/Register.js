import React, { useState } from "react";
import axios from "axios";

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Generate key pair
        const { publicKey, privateKey } = generateKeyPair(); // Placeholder function
        await axios.post("http://localhost:9999/api/auth/register", {
            username,
            masterPassword: password,
            publicKey,
            privateKey,
        });

        alert("Registered successfully!");
    };

    const generateKeyPair = () => {
        // Placeholder for RSA key generation
        return {
            publicKey: "mockPublicKey",
            privateKey: "mockPrivateKey",
        };
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Master Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Register</button>
        </form>
    );
};

export default Register;
