import moment from 'moment';
import { getRepository } from "typeorm";
import { Request, Response } from 'express';
import { Message } from "../entities/Message";
import { User } from "../entities/User";
import { Salon } from "../entities/Salon";
import { Conversation } from "../entities/Conversation";
import { getReceiverSocketId, io } from "../socket/socket"

const messageController = {
  getChattingUsers: async (req: Request, res: Response) => {
    try {
      let userId: any = req.headers['userId'] || "";
      const salon = await getRepository(Salon).findOne({ where: { user_id: userId } });

      const conversations = await getRepository(Conversation)
          .createQueryBuilder("conversation")
          .where("conversation.participants LIKE :userId", { userId: `%${userId}%` })
          .orWhere("conversation.participants LIKE :salonId", { salonId: `%${salon?.salon_id}%` })
          .getMany();

      if (conversations.length === 0) return res.status(200).json([]);

      const chattingUsers: string[] = [];
      conversations.forEach(conversation => {
          conversation.participants.forEach(participant => {
              if (participant !== userId && participant !== salon?.salon_id && !chattingUsers.includes(participant)) {
                  chattingUsers.push(participant);
              }
          });
      });

      const userDetailsPromise = await getRepository(User)
            .createQueryBuilder("user")
            .select(["user_id AS id ", "fullname AS name", "avatar AS image"])
            .where("user_id IN (:...userIds)", { userIds: chattingUsers })
            .getRawMany();

      const salonDetailsPromise = await getRepository(Salon)
            .createQueryBuilder("salon")
            .select(["salon_id AS id", "name", "image"])
            .where("salon_id IN (:...salonIds)", { salonIds: chattingUsers })
            .getRawMany();

      const [userDetails, salonDetails] = await Promise.all([userDetailsPromise, salonDetailsPromise]);

      const chattingUsersAndSalons = userDetails.concat(salonDetails);

      res.status(200).json({
          status: "success",
          chattingUsers: chattingUsersAndSalons,
      });
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({ status: "failed", msg: "Internal Server Error" });
    }
  },
  getMessages: async (req: Request, res: Response) => {
    try {
      const userToChatId: string = req.params.id;
      const userId: any = req.headers['userId'] || "";
      const salon = await getRepository(Salon).findOne({ where: { user_id: userId } });
      const salonReceive = await getRepository(Salon).findOne({ where: { salon_id: userToChatId } });
      
      let participants: string[];

      if (salon?.salon_id !== undefined) {
        if(salonReceive === null){
          participants = [salon.salon_id, userToChatId];
        } else {
          participants = [userId, userToChatId];
        }
      } else {
        participants = [userId, userToChatId];
      }

      const conversation = await getRepository(Conversation).createQueryBuilder("conversation")
          .where("conversation.participants LIKE :participants", { participants: `%${participants.join(",")}%` })
          .orWhere("conversation.participants LIKE :participants_reverse", { participants_reverse: `%${participants.reverse().join(",")}%` })
          .getOne();
        
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
      let senderId: any = req.headers['userId'] || "";
      const receiverId: string = req.params.id;
      const { message } = req.body;
      const salon = await getRepository(Salon).findOne({ where: { user_id: senderId } });
      const salonReceive = await getRepository(Salon).findOne({ where: { salon_id: receiverId } });

      let participants: string[];

      if (salon?.salon_id !== undefined) {
        if(salonReceive === null){
          senderId = salon?.salon_id
          participants = [salon.salon_id, receiverId];
        } else {
          participants = [senderId, receiverId];
        }
      }
      else {
        participants = [senderId, receiverId];
      }
            
      let conversation = await getRepository(Conversation).createQueryBuilder("conversation")
          .where("conversation.participants LIKE :participants", { participants: `%${participants.join(",")}%` })
          .orWhere("conversation.participants LIKE :participants_reverse", { participants_reverse: `%${participants.reverse().join(",")}%` })
          .getOne();
            
      if (!conversation) {
      // Create new conversation if not exist
        const conversationRepository = getRepository(Conversation);
        conversation = await conversationRepository.save({
          participants: participants,
          messages: [],
          createdAt: moment().format('YYYY-MM-DDTHH:mm:ss'),
          updatedAt: moment().format('YYYY-MM-DDTHH:mm:ss'),
        });
      }
        
      // Create new message
      const messageRepository = getRepository(Message);
      const savedMessage = await messageRepository.save({
        senderId: senderId,
        receiverId: receiverId,
        message: message,
        createdAt: moment().format('YYYY-MM-DDTHH:mm:ss'),
        updatedAt: moment().format('YYYY-MM-DDTHH:mm:ss'),
      });
        
      // Add message to conversation
      conversation.messages.push(savedMessage.message_id);
      const conversationRepository = getRepository(Conversation);
      await conversationRepository.save(conversation);
        
      // SOCKET IO FUNCTIONALITY WILL GO HERE
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        // io.to(<socket_id>).emit() used to send events to specific client
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