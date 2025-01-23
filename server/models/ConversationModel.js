// server/models/ConversationModel.js

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  cipherText: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['prekey', 'ciphertext'],
    required: true
  },
  msgByUserId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'User',
  },
  seen: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const conversationSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'User',
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'User',
  },
  messages: [  // Embed message documents in conversation for simplicity
    messageSchema,
  ],
}, {
  timestamps: true,
});

const ConversationModel = mongoose.model('Conversation', conversationSchema);
module.exports = { ConversationModel };
