const userController = require("../app/controllers/user.c");
const middlewareController = require("../middleware/middleware.js");

const router = require("express").Router();

/**
 * @swagger
 * tags:
 *   name: /user
 *   description: API for user actions
 */

/**
 * @swagger
 * /user/profile?id={id}:
 *  get:
 *   summary: get information in user's profile
 *   tags: [/user]
 *   parameters:
 *     - name: id
 *       in: path
 *       description: User's ID
 *       required: true
 *       type: integer
 *   security:
 *     - tokenAuth: []
 *   responses:
 *     '200':
 *       description: Register successfully
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInfo'
 *     '500':
 *       description: Internal server error
 */
router.get("/profile", middlewareController.verifyToken, userController.getProfile);

/**
 * @swagger
 * /user/updateProfile:
 *  post:
 *   summary: update information in user's profile
 *   tags: [/user]
 *   requestBody:
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: user's id
 *             fullName:
 *               type: string
 *               description: user's name
 *   security:
 *     - tokenAuth: []
 *   responses:
 *     '200':
 *       description: Register successfully
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInfo'
 *     '500':
 *       description: Internal server error
 */
router.post("/updateProfile", middlewareController.verifyToken, userController.updateProfile);

/**
 * @swagger
 * /user/changePassword:
 *  post:
 *   summary: user change password
 *   tags: [/user]
 *   requestBody:
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: user's id
 *             oldPassword:
 *               type: string
 *               description: user's old password
 *             newPassword:
 *               type: string
 *               description: user's new password
 *   responses:
 *     '200':
 *       description: Change Password Successfully!
 *     '401':
 *       description: Incorrect Old Password!
 *     '500':
 *       description: Internal server error
 */
router.post("/changePassword", middlewareController.verifyToken, userController.changePassword);

router.post("/forgot-password-email", userController.forgotPasswordEmail);

router.get("/verify-forgot-password-email/:token", userController.verifyForgotPasswordTokenFromMail);

router.post('/renew-password-by-forgot-email/:token', userController.renewPasswordByForgotEmail);

module.exports = router;
