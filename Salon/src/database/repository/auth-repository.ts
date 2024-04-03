import { getRepository} from "typeorm";
import { User } from "../models";

require("dotenv").config({ path: "./server/.env" });


export const AuthRepository =  {

    async addUser(data: any) {
        let user = new User();
        user = { ...user, ...data, aso: 0, role: "User", avatar: `https://avatar.iran.liara.run/username?username=${user.username}` };
        const userRepository = getRepository(User);

        try {
            await userRepository.save(user);

            return user;
        } catch (error) {
            throw new Error("Unable to Create User.");
        }
    },

    async findOne(data: any) {
        const userRepository = getRepository(User);

        try {
            const userDb = await userRepository.findOne({
                where: {user_id: data.user_id, username: data.username, email: data.email}
            })

            return userDb;
        } catch (error) {
            throw new Error("Error data.");
        }
    }
    
}

export default AuthRepository;