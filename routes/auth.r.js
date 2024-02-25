const authController = require("../app/controllers/auth.c");
const passport = require('passport');
const middlewareController = require("../middleware/middleware.js");
require('dotenv').config();



const router = require("express").Router();

/**
 * @swagger
 * tags:
 *   name: /auth
 *   description: API for user authentication
 */

/**
 * @swagger
 * /auth/register:
 *  post:
 *   summary: user register
 *   tags: [/auth]
 *   requestBody:
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             fullName:
 *               type: string
 *               description: user's name
 *             email:
 *               type: string
 *               description: user's email
 *             password:
 *               type: string
 *               description: user's password
 *   responses:
 *     '200':
 *       description: Register successfully
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInfo'
 *     '409':
 *       description: Email already exists! / Phone already exists!
 *     '500':
 *       description: Internal server error
 */
router.post("/register", authController.registerUser);

/**
 * @swagger
 * /auth/login:
 *  post:
 *   summary: user login
 *   tags: [/auth]
 *   requestBody:
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               description: user's email/phone
 *             password:
 *               type: string
 *               description: user's password
 *             clientId:
 *               type: string
 *               description: Socket IO client'id
 *           example:
 *             email: example@gmail.com
 *             password: 123
 *             clientId: abc
 *   responses:
 *     '200':
 *       description: Login successfully
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *             - $ref: '#/components/schemas/UserInfo'
 *             - type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *     '401':
 *       description: Wrong Password!
 *     '404':
 *       description: Account doesn't exist!
 *     '500':
 *       description: Internal server error
 */
router.post("/login", authController.loginUser);


// Google authentication route
/**
 * @swagger
 * /auth/google:
 *  get:
 *   summary: Redirects the user to Google for authentication.
 *   tags: [/auth]
 *   responses:
 *     '302':
 *       description: Redirects to the Google authentication page.
 */
router.get('/google', passport.authenticate('google', { scope:
    [ 'email', 'profile' ] }));

router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', (err, profile) => {
        req.user = profile
        next()
    })(req, res, next)
}, authController.googleAuth)

// Facebook authentication route
/**
 * @swagger
 * /auth/facebook:
 *  get:
 *   summary: user login with facebook
 *   tags: [/auth]
 *   responses:

 */
router.get('/facebook', passport.authenticate('facebook', { scope:
    [ 'email', 'public_profile' ] }));

router.get('/facebook/callback',  (req, res, next) => {
    passport.authenticate('facebook', (err, profile) => {
        req.user = profile
        next()
    })(req, res, next)
}, authController.facebookAuth);


/**
 * @swagger
 * /auth/refresh:
 *  post:
 *   summary: user requests for new access token and new refresh token
 *   tags: [/auth]
 *   security:
 *     - cookieAuth: []
 *   responses:
 *     '200':
 *       description: Refresh successfully
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessToken:
 *                 type: string
 *                 description: JWT access token
 *     '401':
 *       description: 401 Unauthorized!
 *     '403':
 *       description: 403 Forbidden!
 *     '500':
 *       description: Internal server error
 */
router.post("/refresh", authController.requestRefreshToken);

/**
 * @swagger
 * /auth/logout:
 *  post:
 *   summary: user logout
 *   tags: [/auth]
 *   requestBody:
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: user's id
 *   security:
 *     - cookieAuth: []
 *     - tokenAuth: []
 *   responses:
 *     '200':
 *       description: Logged out successfully!
 *     '401':
 *       description: 401 Unauthorized!
 *     '403':
 *       description: 403 Forbidden!
 *     '500':
 *       description: Internal server error
 */
router.post("/logout", middlewareController.verifyToken, authController.logoutUser);


module.exports = router;
