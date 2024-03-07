import dotenv from 'dotenv';
import { User } from "../entities/User";
import { DataSourceOptions } from 'typeorm';

dotenv.config({ path: './server/.env' });

export const connectionString: DataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User],
    synchronize: true
  }