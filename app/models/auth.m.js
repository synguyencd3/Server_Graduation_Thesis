const userM = require('./user.m')
const db = require("../../config/connect_db");
const bcrypt = require('bcrypt')
const passport = require('passport')
const GoogleStrategy = require( 'passport-google-oauth20' ).Strategy;
const FacebookStrategy = require( 'passport-facebook' ).Strategy;
require('dotenv').config();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

module.exports = app => {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(async function (user, done) {
      const infoUser = await userM.getUserByEmail(user.email);
      if (infoUser) { 
        const {password, ...infoUserWithoutPassword} = infoUser;
        done(null, infoUserWithoutPassword)
      }
    });

    // passport.use(new localStrategy({
    //     usernameField: 'un',
    //     passwordField: 'pw'
    // },
    //     async (username, password, done) => {
    //         try {
    //             const user = await userM.byname(username);
    //             if (!user) { return done(null, false); }
    //             const cmp = await bcrypt.compare(password, user[0]['f_Password']);
    //             if (!cmp) { return done(null, false); }
    //             return done(null, user);
    //         } catch (err) {
    //             return done(err);
    //         }
    //     }));

    passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        passReqToCallback: true
    },
    async function (request, accessToken, refreshToken, profile, done)  {
      const user = {
        id: profile.id,
        email: profile.emails[0].value,
        fullName: profile.displayName,
      };
    
      // Check if the user exists in the database, if not, add them
      const existingUser = await db.oneOrNone('SELECT * FROM users WHERE email = $1', user.email);
      if (existingUser) {
        return done(null, existingUser);
      } else {
        const salt =await bcrypt.genSalt(11);
        const hashPassword = await bcrypt.hash('hello1', salt);
        const newUser = await db.one(
          'INSERT INTO users (id, email, password, full_name, activation) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [user.id, user.email, hashPassword, user.fullName, true]
        )
        return done(null, newUser)
      }
    }
    ));

    passport.use(new FacebookStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALL_BACK_URL,
        profileFields: ['email','photos', 'id', 'displayName']
      },
      async function (request, accessToken, refreshToken, profile, done) {
        console.log('profile', profile);
        const user = {
          id: profile.id,
          email: profile.emails[0].value,
          fullName: profile.displayName,
        };
      
        // Check if the user exists in the database, if not, add them
        const existingUser = await db.oneOrNone('SELECT * FROM users WHERE email = $1', user.email);
        if (existingUser) {
          return done(null, existingUser);
        } else {
          const salt =await bcrypt.genSalt(11);
          const hashPassword = await bcrypt.hash('hello1', salt);
          const newUser = await db.one(
            'INSERT INTO users (id, email, password, full_name, activation) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user.id, user.email, hashPassword, user.fullName, true]
          )
          return done(null, newUser)
        }
    }
      ));

}
