import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import router from "./routes";
import cors from "cors";
import session from 'express-session';
import { createConnection } from "typeorm";
// import authenticate from './models/auth.m';
import dotenv from "dotenv";
import { User } from "./entities/User";

dotenv.config();

const port: number = parseInt(process.env.PORT as string, 10) || 5000;
createConnection({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User],
  synchronize: true,
})
  .then(async (connection) => {
    const app = express();
    app.use(express.static(path.join(__dirname, "public")));
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(express.json());
    app.use(session({ secret: process.env.SESSION_SECRET_KEY as string, resave: true, saveUninitialized: true }));
    
    app.use(cors());
    
    // authenticate(app);
    
    router(app);
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }) .catch((error) => console.log(error));


