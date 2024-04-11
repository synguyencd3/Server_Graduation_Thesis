import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config({ path: "./server" });

export const sendMail = async (content: string, to: string) => {
    const mailConfigurations = {
        from: process.env.EMAIL_ADDRESS || "webnangcao.final@gmail.com",
        to: to,
        subject: "Email Verification - Cars Salon App",
        html: content
    };

    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    try {
       await transporter.sendMail(mailConfigurations);
        return true;
    } catch (error) {
        return false;
    }
}