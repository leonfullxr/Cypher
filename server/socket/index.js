const express = require('express')
const { Server } = require('socket.io')
const http = require('http')
const getUserDetailsFromToken = require('../services/getUserDetailsFromToken')
const UserModel = require('../models/UserModel')
const { ConversationModel, MessageModel } = require('../models/ConversationModel')
const getConversation = require('../services/getConversation')

const app = express()

/** Socket connection **/
const server =  http.createServer(app)
const io = new Server(server, {
    cors : {
        origin : process.env.FRONTEND_URL,
        credentials : true
    }
})

const onlineUser = new Set()

io.on('connection', async (socket)=>{
    console.log('connect User', socket.id)

    const token = socket.handshake.auth.token

    // current user details
    const user = await getUserDetailsFromToken(token)

    // create a room
    socket.join(user?._id?.toString())
    onlineUser.add(user?._id?.toString())

    io.emit('onlineUser', Array.from(onlineUser))

    socket.on('message-page', async (userId)=>{
        console.log('userId', userId)
        const userDetails = await UserModel.findById(userId).select('-password')

        const payload = {
            _id : userDetails?._id,
            name : userDetails?.name,
            email : userDetails?.email,
            profile_pic : userDetails?.profile_pic,
            online : onlineUser.has(userId)
        }

        socket.emit('message-user', payload)

        // get previous message
        const getConversationMessage = await ConversationModel.findOne({
            "$or" : [
                { sender : user?._id, receiver : userId },
                { sender : userId, receiver :  user?._id}
            ]
        }).populate('message').sort({ updatedAt : -1 })

        socket.emit('message',getConversationMessage?.message || [])
    })

    // send new message
    socket.on('new message', async (data) => {
        // 1) If conversation doesn't exist, create it:
        let conversation = await ConversationModel.findOne({
        "$or": [
            { sender: data.sender, receiver: data.receiver },
            { sender: data.receiver, receiver: data.sender }
        ]
        });
    
        if (!conversation) {
        const createConversation = new ConversationModel({
            sender: data.sender,
            receiver: data.receiver,
        });
        conversation = await createConversation.save();
        }
    
        // 2) Create the message with two encrypted fields:
        const message = new MessageModel({
        textForRecipient: data.textForRecipient, // <-- encrypted for recipient
        textForSender: data.textForSender,       // <-- encrypted for sender
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        msgByUserId: data.msgByUserId,
        });
        const saveMessage = await message.save();
    
        // Add the new message to the conversation
        await ConversationModel.updateOne({ _id: conversation._id }, {
        $push: {
            message: saveMessage._id
        }
        });
    
        // Re-fetch the conversation with all messages
        const getConversationMessage = await ConversationModel.findOne({
        "$or": [
            { sender: data.sender, receiver: data.receiver },
            { sender: data.receiver, receiver: data.sender }
        ]
        }).populate('message').sort({ updatedAt: -1 });
    
        // Emit the message list to both users
        io.to(data.sender).emit('message', getConversationMessage?.message || []);
        io.to(data.receiver).emit('message', getConversationMessage?.message || []);
    
        // Send the updated conversation (to refresh the 'last message' in the sidebar)
        const conversationSender = await getConversation(data.sender);
        const conversationReceiver = await getConversation(data.receiver);
    
        io.to(data.sender).emit('conversation', conversationSender);
        io.to(data.receiver).emit('conversation', conversationReceiver);
    });
  

    // sidebar
    socket.on('sidebar', async(currentUserId)=>{
        console.log('current user', currentUserId)
        const conversation = await getConversation(currentUserId)
        socket.emit('conversation', conversation)    
    })

    // seen message, to update the 'seen' status of the message
    socket.on('seen', async (msgByUserId)=>{
        let conversation = await ConversationModel.findOne({
            "$or" : [
                {
                    sender : user?._id,
                    receiver : msgByUserId
                },
                {
                    sender : msgByUserId,
                    receiver : user?._id
                }
            ]
        }) 
        const conversationMessageId = conversation?.message || []
        const updateMessages = await MessageModel.updateMany(
            {_id : { "$in" : conversationMessageId }, msgByUserId : msgByUserId},
            { "$set" : { seen : true } }
        )

        // send conversation
        const conversationSender = await getConversation(user?._id.toString())
        const conversationReceiver = await getConversation(msgByUserId)

        io.to(user?._id.toString()).emit('conversation',conversationSender)
        io.to(msgByUserId).emit('conversation',conversationReceiver)
    })

    // disconnect
    socket.on('disconnect',()=>{
        onlineUser.delete(user?._id?.toString())
        console.log('disconnect user', socket.id)
    })
})

module.exports = {
    app,
    server
}
