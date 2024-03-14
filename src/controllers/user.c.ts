import { Request, Response } from 'express';
import { User } from "../entities/User";
import { getRepository } from "typeorm";
const cloudinary = require("cloudinary").v2;
import { getFileName } from "../utils/index"

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
        //const userId: any = req.headers['userId'] || "";
        const userId = (req as any).user.userId
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

    updateProfile: async (req: Request | MulterFileRequest, res: Response) => {
        const userRepository = getRepository(User);
        const userId = (req as any).user.userId
        const {fullname, gender, phone, address, date_of_birth } = req.body;

        const oldUser = await userRepository.findOne({
            where: {
                user_id: userId,
            },
        })

        let avatar = "", filename = ""
        if ('file' in req && req.file) {
            avatar = req.file.path;
            filename = req.file.filename;
        }

        if(avatar !== "" && oldUser?.avatar){
            if(!getFileName(oldUser.avatar).includes('default')){
                cloudinary.uploader.destroy(getFileName(oldUser.avatar));
            }
        }

        try {
            // const userDb = await userRepository.findOneOrFail({ where: { user_id: userId } });
            // const saveProfile = {...userDb};
            // await userRepository.save(saveProfile);

            const userDataToUpdate: any = {};
            
            if (fullname) userDataToUpdate.fullname = fullname;
            if (gender) userDataToUpdate.gender = gender;
            if (phone) userDataToUpdate.phone = phone;
            if (address) userDataToUpdate.address = address;
            if (date_of_birth) userDataToUpdate.date_of_birth = date_of_birth;
            if (avatar) userDataToUpdate.avatar = avatar;

            if (Object.keys(userDataToUpdate).length > 0) {
                await userRepository.update(userId, userDataToUpdate);
            }

            const result = await userRepository.findOne({
                where: {
                    user_id: userId,
                },
            })

            let user;
            if(result){
                const { password, ...others } = result;
                user = others
            }

            return res.json({
                status: "success", 
                msg: "Update successfully!",
                newUser: user,
            })
        } catch (error) {
            console.log(error);
            if(filename !== ""){
                cloudinary.uploader.destroy(filename)
            }
            return res.json({
                status: "failed",
                msg: "Invalid information."
            });
        }
    },
};

export default userController;
