import { DataSource } from "typeorm";
import dotenv from 'dotenv';
import { User } from "../entities/User";
import { Account } from "../entities/Account";

dotenv.config({ path: './server/.env' });

export const connectionString = {
    "type": "postgres",
    "host": process.env.DB_HOST,
    "port": Number(process.env.DB_PORT),
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "entities": [User, Account],
    "synchronize": true
};