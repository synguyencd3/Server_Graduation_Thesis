import bcrypt from "bcrypt";
import AuthRepository from "../database/repository/auth-repository"
const { v4: uuidv4 } = require("uuid");
import jwt from "jsonwebtoken";
import axios from "axios";
import { User } from "../database/models";

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

            const accessToken = await this.generateAccessToken(userDb);
            const refreshToken: any = await this.generateRefreshToken(userDb);

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

    async logoutUser(data: any) {
        console.log("FILTER 0")

        refreshTokens = refreshTokens.filter(
            (token) => token !== data.cookies.refreshToken || data.body.refreshToken
        );

        console.log("FILTER 1")
    }

    async requestRefreshToken(data: any) {
        const refreshToken = data.cookies.refreshToken || data.body.refreshToken;

        if (!refreshToken)
            throw new Error("401 Unauthorized!");

        // check if we have a refresh token but it isn't our refresh token
        if (!refreshTokens.includes(refreshToken))
            throw new Error("403 Forbidden!");

        jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_KEY as string,
            (err: any, user: any) => {
                if (err) {
                    console.log(err);
                }

                // delete old refresh token
                refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

                // create new JWT_ACCESS_TOKEN and JWT_REFRESH_TOKEN
                const newAccessToken = this.generateAccessToken(user);
                const newRefreshToken: any = this.generateRefreshToken(user);
                refreshTokens.push(newRefreshToken);

                return { accessToken: newAccessToken, refreshToken: newRefreshToken };
            }
        );
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

    async getProfile(data: any) {
        try {
            const userDb = await AuthRepository.findOne(data);

            return userDb;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async handleGoogle(data: any) {
        try {
            return await AuthRepository.handleGoogle(data?.userFe, data?.userDb);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async handleFacebook(data: any) {
        try {
            return await AuthRepository.handleFacebook(data?.userFe, data?.userDb);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async genToken(data: any) {
        const accessToken = await this.generateAccessToken(data);
        const refreshToken = await this.generateRefreshToken(data);

        refreshTokens.push(refreshToken);

        return { accessToken, refreshToken };
    }

    async saveUser(data: any) {
        try {
            await AuthRepository.addUser(data);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async googleAuth(data: any) {
        let userFe: any = data.user;
            const userIdAccount: any = data.userId;

            // console.log("USER FE GG: ", userFe)

            // action for association
            if (userIdAccount && typeof userIdAccount == "string") {
                // check aso of this account in db
                const userDb: any = await AuthRepository.findOne({ user_id: userIdAccount })
                console.log("USER_DB: ", userDb);

                const userGGDb: any = await AuthRepository.findOne({ google: userFe.google })
                console.log("USER_GGDB: ", userGGDb);

                if (!userDb) {
                    throw new Error("invalid information account.");
                }

                if (userDb.google) {
                    throw new Error("This account is linked.");
                }

                console.log("FLAG1");

                try {
                    // link successfully
                    if ((!userGGDb) || (userGGDb.aso == 0) || (userDb.username && userFe.aso == 3) || (userDb.facebook && userFe.aso == 1)) {
                        console.log("FLAG2");
                        userDb.google = userFe.google;
                        await AuthRepository.handleGoogle(userFe, userGGDb);

                        return {
                            status: "success",
                            msg: "linked with google successfully!"
                        }
                    } else {
                        throw new Error ("Not eligible for linking.");
                    }

                } catch (error) {
                    throw new Error ("error with db.");
                }

            }

            // action for login
            if (userFe) {
                const { accessToken, refreshToken } = await this.genToken(data.user);

                // save user to db
                try {
                    await AuthRepository.addUser(userFe);

                    const { password, ...others } = userFe;

                    return {
                        refreshToken,
                        user: others,
                        accessToken,
                        status: "success",
                        msg: "login successfully!",
                    };
                } catch (error) {
                    throw new Error ("error information to save db.");
                }

            }
            throw new Error ("error google account.");
    }

    async facebookAuth(data: any) {
        let userFe: any = data.user;
            const userIdAccount: any = data.userId;

            // action for association
            if (userIdAccount && typeof userIdAccount == "string") {
                // check aso of this account in db
                const userDb: any = await AuthRepository.findOne({ user_id: userIdAccount })
                const userGGDb: any = await AuthRepository.findOne({ facebook: userFe.facebook })

                if (!userDb)
                    throw new Error("invalid information account.");

                if (userDb.google)
                    throw new Error("This account is linked.");


                console.log("FLAG1");

                try {
                    // link successfully
                    if ((!userGGDb) || (userGGDb.aso == 0) || (userDb.username && userFe.aso == 3) || (userDb.google && userFe.aso == 2)) {
                        console.log("FLAG2");
                        userDb.facebook = userFe.facebook;
                        await AuthRepository.handleFacebook(userFe, userGGDb);

                        return {
                            status: "success",
                            msg: "linked with facebook successfully!"
                        };
                    } else {
                        throw new Error ("Not eligible for linking.");
                    }

                } catch (error) {
                    throw new Error ("error with db.");
                }

            }

            // action for login
            if (userFe) {
                const { accessToken, refreshToken } = await this.genToken(data.user);

                // save user to db
                try {
                    await AuthRepository.addUser(userFe);

                    const { password, ...others } = userFe;
                    // console.log("USER: ", userFe);

                    return {
                        refreshToken,
                        user: others,
                        accessToken,
                        status: "success",
                        msg: "login successfully!",
                    };
                } catch (error) {
                    throw new Error ("error information to save db.");
                }

            }

            throw new Error ("error facebook account.");
    }

    async facebookMBAuth(data: any) {
        const accessToken = data.accessToken;
        const FACEBOOK_GRAPH_API_VERSION = 'v15.0';
        const userIdAccount: any = data.userId;

        if (!accessToken) {
            throw new Error ("invalid acesstoken facebook.")
        }

        try {
            const response = await axios.get(`https://graph.facebook.com/${FACEBOOK_GRAPH_API_VERSION}/me?access_token=${accessToken}&fields=id,name,email`);
            const { id, name, email } = response.data;
            let userFe: any = await AuthRepository.findOne({ facebook: email });

            if (!userFe) {
                userFe = new User();
                userFe.user_id = id;
                userFe.aso = 1;
                userFe.facebook = email;
            }
            // action for association
            if (userIdAccount && typeof userIdAccount == "string") {
                // check aso of this account in db
                const userDb: any = await AuthRepository.findOne({ user_id: userIdAccount })
                const userGGDb: any = await AuthRepository.findOne({ facebook: userFe.facebook })

                if (!userDb)
                    throw new Error("invalid information account.");

                if (userDb.google)
                    throw new Error("This account is linked.");


                console.log("FLAG1");

                try {
                    // link successfully
                    if ((!userGGDb) || (userGGDb.aso == 0) || (userDb.username && userFe.aso == 3) || (userDb.google && userFe.aso == 2)) {
                        console.log("FLAG2");
                        userDb.facebook = userFe.facebook;
                        await AuthRepository.handleFacebook(userFe, userGGDb);

                        return {
                            status: "success",
                            msg: "linked with facebook successfully!"
                        };
                    } else {
                        throw new Error ("Not eligible for linking.");
                    }

                } catch (error) {
                    throw new Error ("error with db.");
                }

            }

            // action for login
            if (userFe) {
                const { accessToken, refreshToken } = await this.genToken(data.user);

                // save user to db
                try {
                    await AuthRepository.addUser(userFe);

                    const { password, ...others } = userFe;
                    // console.log("USER: ", userFe);

                    return {
                        refreshToken,
                        user: others,
                        accessToken,
                        status: "success",
                        msg: "login successfully!",
                    };
                } catch (error) {
                    throw new Error ("error information to save db.");
                }

            }

            throw new Error ("error facebook account.");

        } catch (error) {
            throw new Error ("The access token is invalid or has expired.");
        }
    }
}

export default AuthService;
