import { Request, Response } from 'express';
import axios from 'axios';
import jwt from "jsonwebtoken";

require("dotenv").config({ path: "./server/.env" });

const videocallController = {
    getToken: (req: Request, res: Response) => {
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
    }
};

export default videocallController;
