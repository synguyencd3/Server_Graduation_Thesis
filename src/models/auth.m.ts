import { Express } from 'express';
import db from '../config/connect_db';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Profile } from 'passport-facebook';
import { Profile as GoogleProfile } from 'passport-google-oauth20';
import userM from './user.m'; // Update path according to your file structure

require('dotenv').config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL as string;

module.exports = (app: Express) => {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (user: any, done) {
        done(null, user);
    });

    passport.deserializeUser(async function (user: any, done) {
        const infoUser = await userM.getUserByEmail(user.email);
        if (infoUser) {
            const { password, ...infoUserWithoutPassword } = infoUser;
            done(null, infoUserWithoutPassword);
        }
    });

    passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        passReqToCallback: true
    },
        async function (request: any, accessToken: string, refreshToken: string, profile: GoogleProfile, done: any) {
            const user = {
                id: profile.id,
                email: profile.emails ? profile.emails[0].value : '', // Added check for emails existence
                fullName: profile.displayName,
            };

            // Check if the user exists in the database, if not, add them
            const existingUser = await db.oneOrNone('SELECT * FROM users WHERE email = $1', user.email);
            if (existingUser) {
                return done(null, existingUser);
            } else {
                const salt = await bcrypt.genSalt(11);
                const hashPassword = await bcrypt.hash('hello1', salt);
                const newUser = await db.one(
                    'INSERT INTO users (id, email, password, full_name, activation) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                    [user.id, user.email, hashPassword, user.fullName, true]
                );
                return done(null, newUser);
            }
        }
    ));

    // passport.use(new FacebookStrategy({
    //     clientID: process.env.CLIENT_ID as string,
    //     clientSecret: process.env.CLIENT_SECRET as string,
    //     callbackURL: process.env.CALL_BACK_URL as string,
    //     profileFields: ['email', 'photos', 'id', 'displayName']
    // },
    //     async function (request: any, accessToken: string, refreshToken: string, profile: Profile, done: any) {
    //         const user = {
    //             id: profile.id,
    //             email: profile.emails ? profile.emails[0].value : '', // Added check for emails existence
    //             fullName: profile.displayName,
    //         };

    //         // Check if the user exists in the database, if not, add them
    //         const existingUser = await db.oneOrNone('SELECT * FROM users WHERE email = $1', user.email);
    //         if (existingUser) {
    //             return done(null, existingUser);
    //         } else {
    //             const salt = await bcrypt.genSalt(11);
    //             const hashPassword = await bcrypt.hash('hello1', salt);
    //             const newUser = await db.one(
    //                 'INSERT INTO users (id, email, password, full_name, activation) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    //                 [user.id, user.email, hashPassword, user.fullName, true]
    //             );
    //             return done(null, newUser);
    //         }
    //     }
    // ));
};
