import bcrypt from "bcrypt";
import AuthRepository from "../database/repository/auth-repository"
// import { AuthRepository } from "../database";
const { v4: uuidv4 } = require("uuid");
import jwt, { decode } from "jsonwebtoken";

require("dotenv").config({ path: "./server/.env" });

let refreshTokens: string[] = [];

class AuthService {

    // generate JWT_ACCESS_TOKEN
    async generateAccessToken(user: { user_id: string }) {
        return jwt.sign(
            {
                userId: user.user_id,
            },
            process.env.JWT_ACCESS_KEY as string,
            { expiresIn: "2h" }
        );
    }

    // generate JWT_REFRESH_TOKEN
    async generateRefreshToken(user: { user_id: string }) {
        return jwt.sign(
            {
                userId: user.user_id,
            },
            process.env.JWT_REFRESH_KEY as string,
            { expiresIn: "14d" }
        );
    }

    async registerUser(user: any) {

        if (user.username === undefined || user.password === undefined) {
            throw new Error("Missing required input data.");
        }

        try {
            const userDb = await AuthRepository.findOne({ username: user.username });

            if (userDb != null) {
                throw new Error("This username is existed.");
            }

            //check length password >= 6 chars
            if (user.password.length < 6) {
                throw new Error("Password length must be at least 6 characters.");
            }

            try {
                // add new user to db - Account
                user.user_id = await uuidv4();
                const salt = await bcrypt.genSalt(11);
                user.password = await bcrypt.hash(user.password, salt);
                await AuthRepository.addUser(user)

                const { password, ...other } = user

                return {
                    status: "success",
                    msg: "Register successfully!"
                };
            } catch (error) {
                throw new Error("Register failure.");
            }
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async loginUser(data: any) {
        if (data.username === undefined || data.password === undefined) {
            throw new Error("Missing required input data.");
        }

        if (typeof data.username !== "string" || typeof data.password !== "string") {
            throw new Error("Invalid data types for input (username should be string, password should be string)");
        }

        try {
            // get user from database
            const userDb = await AuthRepository.findOne({ username: data.username });

            if (userDb == null) {
                throw new Error("Username or password is incorect.");
            }

            const validPassword = await bcrypt.compare(
                data.password,
                userDb.password
            );

            if (!validPassword) {
                throw new Error("Username or password is incorect.");
            }

            const accessToken = this.generateAccessToken(userDb);
            const refreshToken: any = this.generateRefreshToken(userDb);

            refreshTokens.push(refreshToken);

            const { password, ...others } = userDb;

            return {
                refreshToken,
                user: others,
                accessToken,
                status: "success",
                msg: "login successfully!",
            }
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async SubscribeEvents(payload: any) {

        const { event, data } = payload;

        switch (event) {
            case 'REGISTER_USER':
                this.registerUser(data)
                break;
            case 'LOGIN_USERNAME':
                this.loginUser(data)
                break;
            default:
                break;
        }

    }
}

export default AuthService;
