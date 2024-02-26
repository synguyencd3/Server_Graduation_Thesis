import { DataSource, getRepository } from "typeorm";
import dotenv from 'dotenv';


// dotenv.config({ path: './back-end/.env' });

export const myDataSource = new DataSource({
    "type": "postgres",
    "host": process.env.DB_HOST,
    "port": Number(process.env.DB_PORT),
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "entities": [],
    "synchronize": true
})