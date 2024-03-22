import { Request, Response } from 'express';
import { Not, getRepository } from 'typeorm';
import { Notification } from '../entities';

const notificationController = {
  getAllById: async (req: Request, res: Response) => {
    const userId: any = req.headers['userId'] || "";
    const notifiRepository = getRepository(Notification)
    const notifiDb = await notifiRepository.find({
        where: {to: userId}
    })

    return res.status(200).json({
        status: "success",
        notifiDb
    })
  },

  deleteOneOrAll: async (req: Request, res: Response) => {
    const userId: any = req.headers['userId'] || "";
    const {id} = req.body;
    const notifiRepository = getRepository(Notification)
    try {
        await notifiRepository.delete({to: userId, id: id});

        return res.status(200).json({
            status: "success",
            msg: "delete successfully!"
        })
    } catch (error) {
        return res.status(404).json({
            status: "failed",
            msg: "delete error."
        })
    }
  },

};

export default notificationController;
