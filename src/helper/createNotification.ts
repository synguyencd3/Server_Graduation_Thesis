import { getRepository } from 'typeorm';
import { Notification } from '../entities';
import { getReceiverSocketId, io } from "../socket/socket"


const createNotification = async (data: Object|any): Promise<boolean> => {
    const notifiRepository = getRepository(Notification);
    let saveData = new Notification();
    saveData.to = data.to;
    saveData.description = data.description;
    saveData.data = data.data;
    saveData.types = data.types;
    saveData.avatar = data.avatar;

    try {
        await notifiRepository.save(saveData);
        // emit socket messgage here.
        // const receiverSocketId = getReceiverSocketId(data.to);
        const receiverSocketId = getReceiverSocketId(data.reciverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("notification", "Have new notification.");
        }
        
        return true;
    } catch (error) {
        return false;
    }
}

export default createNotification;
