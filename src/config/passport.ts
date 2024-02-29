import passport, { use } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { User } from '../entities/User';
import { getRepository } from "typeorm";
import bcrypt from "bcrypt";

dotenv.config({ path: "./server" });

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "clientId",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "clientSecret",
    callbackURL: "http://localhost:5000/auth/google/callback"
},
    async (accessToken, refreshToken, profile: any, done) => {
        let user = new User();
        user.user_id = profile.id;
        user.email = profile.emails[0].value;
        user.fullname = profile.displayName;

        try {
            // Check if the user exists in the database, if not, add them
            const userRepository = getRepository(User);
            let userDb = await userRepository.findOne({
                select: ["user_id", "email"],
                where: {google: profile.emails[0].value}
            });
            
            if (!userDb) {
                // user does not exist yet => add account to user db
                user.google = profile.emails[0].value;
                const salt =await bcrypt.genSalt(11);
                const hashPassword = await bcrypt.hash(process.env.GOOGLE_PASSWORD_RANDOM||'@123abc456ABC@', salt);
                user.password = hashPassword;
                await userRepository.save(user);

                return done(null, user);
            }

            // If user existed but empty email => add email for this user
            if (!userDb.email) {
                userDb.email = user.email;
                userRepository.save(userDb);
            }

            return done(null, userDb);
        } catch (error: any) {
            return done(error);
        }
    }
));

export default passport;
