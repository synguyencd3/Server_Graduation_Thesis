import { getRepository } from 'typeorm';
import { Notification, Salon } from '../entities';
import { getReceiverSocketId, io } from "../socket/socket"


const createNotification = async (data: Object|any): Promise<boolean> => {
    const notifiRepository = getRepository(Notification);
    let saveData = new Notification();
    saveData.to = data.to;
    saveData.description = data.description;
    saveData.data = data.data;
    saveData.types = data.types;
    saveData.avatar = data.avatar;
    let reciverId: string = data.to;

    try {
        if(!data.isUser) {
            const salonRepository = getRepository(Salon);
            const salonDb = await salonRepository.findOneOrFail({
                where: {salon_id: data.to},
                relations: ['user']
            }) 
            reciverId = salonDb.user.user_id
        }

        await notifiRepository.save(saveData);
        // emit socket messgage here.
        const receiverSocketId = getReceiverSocketId(reciverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("notification", "Have new notification.");
        }
        
        return true;
    } catch (error) {
        return false;
    }
}

export default createNotification;
