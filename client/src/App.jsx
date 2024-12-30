import React from 'react';
import SendMessage from './components/SendMessage.jsx';
import ReceiveMessages from './components/ReceiveMessages.jsx';

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
