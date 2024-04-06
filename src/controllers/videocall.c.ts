import { Request, Response } from 'express';
import axios from 'axios';
import jwt from "jsonwebtoken";
import { generateToken04 } from "../config/zegoServerAssistant";
const { v4: uuidv4 } = require("uuid");

require("dotenv").config({ path: "./server/.env" });

const videocallController = {
    getToken: (req: Request, res: Response) => {
        console.log("GET TOKEN.")
        const API_KEY = process.env.VIDEOSDK_API_KEY;
        const SECRET_KEY: any = process.env.VIDEOSDK_SECRET_KEY;

        const options: any = { expiresIn: "10m", algorithm: "HS256" };

        const payload = {
            apikey: API_KEY,
            permissions: ["allow_join", "allow_mod"], // also accepts "ask_join"
        };

        const token = jwt.sign(payload, SECRET_KEY, options);
        res.json({ token });
    },

    createMeeting: (req: Request, res: Response) => {
        console.log("create meeting.")
        const { token, region } = req.body;
        const url = `${process.env.VIDEOSDK_API_ENDPOINT}/api/meetings`;
        const options = {
            method: "POST",
            headers: { Authorization: token, "Content-Type": "application/json" },
            body: JSON.stringify({ region }),
        };

        axios(url, options)
            .then(response => {
                // Kiểm tra nếu response không thành công
                if (!response.data) {
                    throw new Error('No data returned from the server');
                }
                return response.data;
            })
            .then(result => res.json(result)) // result will contain meetingId
            .catch(error => console.error("error", error));
    },

    validateMeeting: (req: Request, res: Response) => {
        console.log("validate meeting.")
        const token = req.body.token;
        const meetingId = req.params.meetingId;

        const url = `${process.env.VIDEOSDK_API_ENDPOINT}/api/meetings/${meetingId}`;

        const options = {
            method: "POST",
            headers: { Authorization: token },
        };

        axios(url, options)
            .then(response => {
                // Kiểm tra nếu response không thành công
                if (!response.data) {
                    throw new Error('No data returned from the server');
                }
                return response.data;
            })
            .then(result => res.json(result)) // result will contain meetingId
            .catch(error => console.error("error", error));
    },

    getTokenZegoCloud: (req: Request, res: Response) => {
        const APP_ID = process.env.ZEGOCLOUD_APP_ID || "";
        const SERVER_SECRET = process.env.ZEGOCLOUD_SERVER_SECRET || "";
        // const userName = req.body.userName||req.body.userId;
        const expiredTs: any = req.body.expired_ts || 3600;
        const userId: any = req.user;

        // create payload:
        const payloadObject = {
            room_id: uuidv4(),
            privilege: {
                1: 1,   // loginRoom: 1 pass , 0 not pass
                2: 0    // publishStream: 1 pass , 0 not pass
            },
        }
        const payload = JSON.stringify(payloadObject);
        // const payload = "";

        const token = generateToken04(
            parseInt(APP_ID),
            userId,
            SERVER_SECRET,
            parseInt(expiredTs),
            payload
        );

        res.json({
            sattus: "success",
            token
        });
    },
};

export default videocallController;
