import UserRepository from "../database/repository/user-repository"

require("dotenv").config({ path: "./server/.env" });

class UserService {

    async getProfile(data: any) {
        try {
            const userDb = UserRepository.findOne(data);

            return userDb;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async updateProfile(data: any) {
        // comming soon.

    }

    async SubscribeEvents(payload: any) {

        const { event, data } = payload;

        switch (event) {
            case 'GET_PROFILE':
                this.getProfile(data)
                break;
            case 'UPDATE_PROFILE':
                this.updateProfile(data)
                break;
            default:
                break;
        }

    }
}

export default UserService;
