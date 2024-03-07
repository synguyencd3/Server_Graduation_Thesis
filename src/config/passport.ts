import passport, { use } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import dotenv from 'dotenv';
import { User } from '../entities/User';
import { getRepository } from "typeorm";

dotenv.config({ path: "./server" });

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(async function (user: any, done) {
  const userRepository = getRepository(User);
  const infoUser = await userRepository.findOne({
    select: ["user_id", "password", "username", "fullname", "gender", "phone", "email", "address", "avatar", "role"],
    where: {email: user.email}
  });
  if (infoUser) { 
    const {password, ...infoUserWithoutPassword} = infoUser;
    done(null, infoUserWithoutPassword)
  }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "clientId",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "clientSecret",
    callbackURL: process.env.GOOGLE_CALLBACK_URL2||"http://localhost:3000/auth/google/callback"
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
                await userRepository.save(user);

                return done(null, user);
            }

            // If user existed but empty email => add email for this user
            if (!userDb.email) {
                userDb.email = user.email;
                await userRepository.save(userDb);
            }

            return done(null, userDb);
        } catch (error: any) {
            return done(error);
        }
    }
));

passport.use(new FacebookStrategy({
    clientID: process.env.CLIENT_ID || "clientId",
    clientSecret: process.env.CLIENT_SECRET || "clientSecret",
    callbackURL: process.env.CALL_BACK_URL2 || "callbackurl",
    profileFields: ['email', 'photos', 'id', 'displayName']
},
async function (accessToken, refreshToken, profile: any, done) {
    // console.log('profile___', profile);
    let user = new User();
    user.user_id = profile.id;
    user.email = profile.emails[0].value;
    user.fullname = profile.displayName;

    // Check if the user exists in the database, if not, add them
    try {
        // Check if the user exists in the database, if not, add them
        const userRepository = getRepository(User);
        let userDb = await userRepository.findOne({
            select: ["user_id", "email"],
            where: {facebook: profile.emails[0].value}
        });
        
        if (!userDb) {
            // user does not exist yet => add account to user db
            user.facebook = profile.emails[0].value;
            // const salt =await bcrypt.genSalt(11);
            // const hashPassword = await bcrypt.hash(process.env.GOOGLE_PASSWORD_RANDOM||'@123abc456ABC@', salt);
            // user.password = hashPassword;
            await userRepository.save(user);

            return done(null, user);
        }

        // If user existed but empty email => add email for this user
        if (!userDb.email) {
            userDb.email = user.email;
            await userRepository.save(userDb);
        }

        return done(null, userDb);
    } catch (error: any) {
        return done(error);
    }
}));

////////////////////////////////////////////////////////
// passport.serializeUser(function(user: any, cb) {
//     process.nextTick(function() {
//       cb(null, { id: user.id, username: user.username, name: user.name });
//     });
//   });

//   passport.deserializeUser(function(user: any, cb) {
//     process.nextTick(function() {
//       return cb(null, user);
//     });
//   });

//   passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID || "clientId",
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET || "clientSecret",
//     callbackURL: "http://localhost:5000/auth/google/callback",
//     scope: [ 'profile' ],
//     state: true
// },
//     async (accessToken, refreshToken, profile: any, done) => {
//         let user = new User();
//         user.user_id = profile.id;
//         user.email = profile.emails[0].value;
//         user.fullname = profile.displayName;

//         try {
//             // Check if the user exists in the database, if not, add them
//             const userRepository = getRepository(User);
//             let userDb = await userRepository.findOne({
//                 select: ["user_id", "email"],
//                 where: {google: profile.emails[0].value}
//             });
            
//             if (!userDb) {
//                 // user does not exist yet => add account to user db
//                 user.google = profile.emails[0].value;
//                 await userRepository.save(user);

//                 return done(null, user);
//             }

//             // If user existed but empty email => add email for this user
//             if (!userDb.email) {
//                 userDb.email = user.email;
//                 await userRepository.save(userDb);
//             }

//             return done(null, userDb);
//         } catch (error: any) {
//             return done(error);
//         }
//     }
// ));

export default passport;
