import React from "react";
import SendMessage from "./components/SendMessage";
import ReceiveMessages from "./components/ReceiveMessages";

function App() {
    return (
        <div>
            <h1>Secure Chat Application</h1>
            <SendMessage />
            <ReceiveMessages />
        </div>
    );
}

export default App;
