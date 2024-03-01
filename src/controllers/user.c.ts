import { Request, Response } from 'express';
import { User } from "../entities/User";
import { getRepository } from "typeorm";

const userController = {
    getAllUsers: async (req: Request, res: Response) => {
        const userRepository = getRepository(User);
        const rs = await userRepository.find({});
        return res.status(200).json(rs);
    },
};

export default userController;
