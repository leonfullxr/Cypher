const { ConversationModel } = require('../models/ConversationModel.js')

const getConversation = async (currentUserId) => {
    if(currentUserId) {
        const currentUserConversation = await ConversationModel.find({
            $or : [
                { sender : currentUserId },
                { receiver : currentUserId }
            ]
        }).sort({ updatedAt : -1 }).populate('message').populate('sender').populate('receiver')

        const conversation = currentUserConversation.map((conv)=>{
            const countUnseenMsg = conv?.message?.reduce((preve,curr) => {
                const msgByUserId = curr?.msgByUserId?.toString()
                if(msgByUserId !== currentUserId) {
                    return preve + (curr.seen ? 0 : 1)
                } else {
                    return preve
                }
                
            },0)
            return {
                _id : conv?._id,
                sender : conv?.sender,
                receiver : conv?.receiver,
                unseenMessage : countUnseenMsg,
                lastMsg : conv?.message[conv?.message?.length - 1]
            }
        })

        return conversation
    } else {
        return []
    }
}

module.exports = getConversation;