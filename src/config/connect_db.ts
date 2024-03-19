import dotenv from 'dotenv';
import { User, Package, Feature, Car, Salon, Notification, User_Package } from "../entities";

import { DataSourceOptions } from 'typeorm';

dotenv.config({ path: './server/.env' });

export const connectionString: DataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, Package, Feature, Car, Salon, Notification, User_Package],
    synchronize: true
  }