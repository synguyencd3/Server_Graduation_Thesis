import { getRepository, getManager} from "typeorm";
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
    },

    async handleGoogle (userFe: any, userDb: any) {
        const entityManager = getManager();

        try {
            await entityManager.transaction(async transactionalEntityManager => {
                // find and delete old google account.
                const oldUser = await transactionalEntityManager.findOne(User, { where: { google: userFe.google } });
                // console.log("OLD_USER: ", oldUser);
                if (oldUser) {
                    await transactionalEntityManager.remove(oldUser);
                    console.log("FLAG4");
                }
                console.log("FLAG3");
                // save new information for this user with new google.
                //set value for aso
                userDb.username ? userDb.aso = 1 : userDb.aso = 3;
                (userDb.username && userDb.facebook) ? userDb.aso = 4 : 1;
                //save to db
                await transactionalEntityManager.save(userDb);
    
                console.log("FLAG5");
            });

            return true;
        } catch (error: any) {
            console.log(error)
            throw new Error (error)
        }
        
    },

    async handleFacebook (userFe: any, userDb: any) {
        const entityManager = getManager();

        try {
            await entityManager.transaction(async transactionalEntityManager => {
                // find and delete old google account.
                const oldUser = await transactionalEntityManager.findOne(User, { where: { facebook: userFe.facebook } });
                if (oldUser) {
                    await transactionalEntityManager.remove(oldUser);
                    console.log("FLAG4");
                }
                console.log("FLAG3");
                // save new information for this user with new google.
                //set value for aso
                userDb.username ? userDb.aso = 2 : userDb.aso = 3;
                (userDb.username && userDb.google) ? userDb.aso = 4 : 1;
                //save to db
                await transactionalEntityManager.save(userDb);
    
                console.log("FLAG5");
            });

            return true;
        } catch (error: any) {
            console.log(error)
            throw new Error (error)
        }
        
    }
    
}

export default AuthRepository;