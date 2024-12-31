const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        
        const connection = mongoose.connection;
        
        connection.once('connected', () => {
            console.log('MongoDB connected');
        });

        connection.on('error', () => {
            console.error('MongoDB connection failed on error ' + error);
        });

    } catch (error) {
        console.error('MongoDB connection failed on catch ' + error);
        process.exit(1);
    }
}

module.exports = connectDB;