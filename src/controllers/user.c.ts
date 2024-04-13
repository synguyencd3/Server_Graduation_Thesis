import { Request, Response } from 'express';
import { User } from "../entities/User";
import { getRepository } from "typeorm";
const cloudinary = require("cloudinary").v2;
import { getFileName } from "../utils/index"
import Cache from '../config/node-cache';

interface MulterFileRequest extends Request {
    file: any; // Adjust this to match the type of your uploaded file
}

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
        const valueCache = await Cache.get(userId + "user");

        if (valueCache) { 
            console.log("get from cache")
            return res.json({
                status: "success",
                profile: valueCache
            });
        }
        
        try {
            const userDb = await userRepository.findOneOrFail({ where: { user_id: userId } });
            const { password, ...others } = userDb;

            // set value for cache.
            Cache.set(userId+"user", others);

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

    updateProfile: async (req: Request | MulterFileRequest, res: Response) => {
        const userRepository = getRepository(User);
        const userId: any = req.headers['userId'] || "";

        let avatar = "", filename = ""
        if ('file' in req && req.file) {
            avatar = req.file.path;
            filename = req.file.filename;
        }
        
        const {fullname, gender, phone, address, date_of_birth } = req.body;
        let newProfile: any = {fullname, gender, phone, address, date_of_birth}
        if(avatar !== "") newProfile.avatar = avatar;
        const {user_id, username, password, email, google, facebook, role, aso, ...other} = newProfile;

        try {
            const userDb = await userRepository.findOneOrFail({where: {user_id: userId}});

            if(avatar !== "" && userDb.avatar){
                if(!getFileName(userDb.avatar).includes('default')){
                    cloudinary.uploader.destroy(getFileName(userDb.avatar));
                }
            }
            const saveProfile = {...userDb, ...other};
            await userRepository.save(saveProfile);

            // set new value for cache
            Cache.del(userId+"user");

            return res.json({
                status: "success",
                msg: "Update successfully!"
            })
        } catch (error) {
            if(filename !== ""){
                cloudinary.uploader.destroy(filename)
            }
            return res.json({
                status: "failed",
                msg: "Invalid information."
            });
        }
    }
};

export default userController;
