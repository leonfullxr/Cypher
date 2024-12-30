import React, { useState } from "react";
import axios from "axios";

function App() {
    const [response, setResponse] = useState("");

    const sendMessage = async () => {
        const res = await axios.post("http://localhost:9999/api/test", {
          message: "Hello Server!",
      });    
        setResponse(res.data.reply);
    };

    return (
        <div>
            <h1>Secure Chat Application</h1>
            <button onClick={sendMessage}>Send Test Message</button>
            <p>Server Response: {response}</p>
        </div>
    );
}

export default App;
