import { getRepository } from 'typeorm';
import { Notification } from '../entities';


const createNotification = async (data: Object|any): Promise<boolean> => {
    const notifiRepository = getRepository(Notification);
    let saveData = new Notification();
    saveData.to = data.to;
    saveData.description = data.description;
    saveData.data = data.data;
    saveData.types = data.types;

    try {
        await notifiRepository.save(saveData);
        // emit socket messgage here.
        return true;
    } catch (error) {
        return false;
    }
}

export default createNotification;
