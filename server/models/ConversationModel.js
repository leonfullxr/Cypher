const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    text : {
        type: String,
        default: ''
    },
    imageUrl : {
        type: String,
        default: ''
    },
    seen : {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const conversationSchema = new mongoose.Schema({
    sender : {
        type: mongoose.Schema.ObjectId,
        required: true,
        refer : 'User'
    },
    receiver : {
        type: mongoose.Schema.ObjectId,
        required: true,
        refer : 'User'
    },
    message : [
        {
            type: mongoose.Schema.ObjectId,
            refer : 'Message'
        }
    ]
}, {
    timestamps: true
});

const MessageModel = mongoose.model('Message', messageSchema);
const ConversationModel = mongoose.model('Conversation', conversationSchema);

module.exports = { 
    MessageModel, 
    ConversationModel 
};