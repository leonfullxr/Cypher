import React, { useState } from "react";
import axios from "axios";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [response, setResponse] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post("http://localhost:9999/api/auth/login", {
                username,
                masterPassword: password,
            });
            setResponse(res.data);
        } catch (error) {
            console.error("Login error:", error);
            alert("Login failed");
        }
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
            <button type="submit">Login</button>
            {response && (
                <div>
                    <h3>Login Successful!</h3>
                    <p>Username: {response.username}</p>
                    <p>Public Key: {response.publicKey}</p>
                </div>
            )}
        </form>
    );
};

export default Login;
