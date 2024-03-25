import { Request, Response } from 'express';
import { Conversation } from "../entities/Conversation";
import { Message } from "../entities/Message";
import { getRepository, In } from "typeorm";
import { getReceiverSocketId, io } from "../socket/socket"
import { getLocalDateTime } from "../utils/index"
import moment from 'moment';

const messageController = {
  getMessages: async (req: Request, res: Response) => {
    try {
      const userToChatId: string = req.params.id;
      const senderId: any = req.headers['userId'] || "";
      let participants = [senderId, userToChatId];
        
      let conversation = await getRepository(Conversation).createQueryBuilder("conversation")
          .where("conversation.participants LIKE :participants", { participants: `%${participants.join(",")}%` })
          .getOne();

      if (!conversation){
        participants = [userToChatId, senderId];
        conversation = await getRepository(Conversation).createQueryBuilder("conversation")
          .where("conversation.participants LIKE :participants", { participants: `%${participants.join(",")}%` })
          .getOne();
      }
        
      if (!conversation) return res.status(200).json([]);
        
      const messageIds = conversation.messages;
            
      const messages = await getRepository(Message)
      .createQueryBuilder("message")
      .where("message.message_id IN (:...messageIds)", { messageIds })
      .getMany();

      const formattedMessages = messages.map(message => {
        return {
          ...message,
          createdAt: moment(message.createdAt).format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: moment(message.updatedAt).format("YYYY-MM-DD HH:mm:ss")
        };
      });

      //const messageContents = messages.map(message => message.message);

      res.status(200).json({
        status: "success",
        messages: formattedMessages,
      });
    } catch (error:any) {
        console.log(error.message);
        return res.status(500).json({ status: "failed", msg: "Internal Server Error" });
    }
  },
  sendMessage: async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      const receiverId: string = req.params.id;
      const senderId: string = req.headers['userId'] ? String(req.headers['userId']) : "";
      let participants = [senderId, receiverId];
            
      let conversation = await getRepository(Conversation).createQueryBuilder("conversation")
      .where("conversation.participants LIKE :participants", { participants: `%${participants.join(",")}%` })
      .getOne();

      if (!conversation){
        participants = [receiverId, senderId];
        conversation = await getRepository(Conversation).createQueryBuilder("conversation")
          .where("conversation.participants LIKE :participants", { participants: `%${participants.join(",")}%` })
          .getOne();
      }
            
      if (!conversation) {
      // Create new conversation if not exist
        const conversationRepository = getRepository(Conversation);
        conversation = await conversationRepository.save({
          participants: [senderId, receiverId],
          messages: [],
          createdAt: getLocalDateTime(),
          updatedAt: getLocalDateTime(),
        });
      }
        
      // Create new message
      const messageRepository = getRepository(Message);
      const savedMessage = await messageRepository.save({
        senderId: senderId,
        receiverId: receiverId,
        message: message,
        createdAt: getLocalDateTime(),
        updatedAt: getLocalDateTime(),
      });
        
      // Add message to conversation
      conversation.messages.push(savedMessage.message_id);
      const conversationRepository = getRepository(Conversation);
      await conversationRepository.save(conversation);
        
      // SOCKET IO FUNCTIONALITY WILL GO HERE
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", savedMessage);
      }
        
      return res.status(201).json({
        status: "success",
        message: savedMessage
      });
    } catch (error:any) {
        console.log(error.message);
        return res.status(500).json({ status: "failed", msg: "Internal Server Error" });
    }
  },
}

export default messageController;