import { Request, Response } from 'express';
import { User } from "../entities/User";
import { getRepository } from "typeorm";

const userController = {
    getAllUsers: async (req: Request, res: Response) => {
        const userRepository = getRepository(User);
        const rs = await userRepository.find({});
        return res.status(200).json(rs);
    },
    getUserById: async (req: Request, res: Response) => {
        const userRepository = getRepository(User);
        const user_id = req.params.id; // Lấy id từ URL params
        // console.log("user_id", user_id);
        try {
            const userDb = await userRepository.find({ where: { user_id: user_id } });
            if (!userDb) {
                return res.status(404).json({ message: "User not found" });
            }
            // fix by Cao Qui - delete password before sending client - 08/03/24
            const { password, ...user } = userDb[0];

            return res.status(200).json(user);
        } catch (error) {
            console.error("Error retrieving user:", error);
            return res.status(500).json({ msg: "Internal server error" });
        }
    },

    getProfile: async (req: Request, res: Response) => {
        const userRepository = getRepository(User);
        const userId: any = req.headers['userId'] || "";
        try {
            const userDb = await userRepository.findOneOrFail({ where: { user_id: userId } });
            const { password, ...others } = userDb;

            return res.json({
                status: "success",
                profile: others
            });
        } catch (error) {
            return res.json({
                status: "failed",
                msg: "Invalid information."
            });
        }
    },

    updateProfile: async (req: Request, res: Response) => {
        const userRepository = getRepository(User);
        const userId: any = req.headers['userId'] || "";
        let {newProfile} = req.body;

        const {user_id, username, password, google, facebook, role, aso, ...other} = newProfile;
        
        try {
            const userDb = await userRepository.findOneOrFail({ where: { user_id: userId } });
            const saveProfile = {...userDb, ...other};
            await userRepository.save(saveProfile);

            return res.json({
                status: "success", 
                msg: "Update successfully!"
            })
        } catch (error) {
            return res.json({
                status: "failed",
                msg: "Invalid information."
            });
        }
    },

};

export default userController;
