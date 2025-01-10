const express = require('express');
const coors = require('cors');
require('dotenv').config();
const connectDB = require('./config/connectDB');
const router = require('./routes/index');
const cookiesParser = require('cookie-parser');
const { app, server } = require('./socket/index')

//const app = express();
app.use(coors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookiesParser());

const PORT = process.env.PORT;

app.get('/', (req, res) => {
    res.json({ 
        message: 'Server is running at ' + PORT 
})});

// api endpoints
app.use('/api', router);

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});