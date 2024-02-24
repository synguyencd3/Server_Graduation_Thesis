const adminController = require('../app/controllers/admin.c.js');
const middlewareController = require("../middleware/middleware.js");

const router = require("express").Router();
/**
 * @swagger
 * tags:
 *   name: /admin
 *   description: API for admin actions
 */

/**
 * @swagger
 * /admin/getAllUsers:
 *  get:
 *   summary: add new user
 *   tags: [/admin]
 *   security:
 *     - tokenAuth: []
 *   responses:
 *     '200':
 *       description: get all users
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInfo'
 *     '500':
 *       description: Internal server error
 */
router.get('/getAllUsers', middlewareController.verifyToken, middlewareController.isAdminGet, adminController.getAllAccount);

/**
 * @swagger
 * /admin/addUser:
 *  post:
 *   summary: add new user
 *   tags: [/admin]
 *   requestBody:
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               description: email of user
 *             password:
 *               type: string
 *               description: password of user
 *             fullName:
 *               type: string
 *               description: full name of user
 *   security:
 *     - tokenAuth: []
 *   responses:
 *     '200':
 *       description: Update user successfully
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInfo'
 *     '500':
 *       description: Internal server error
 */
router.post('/addUser', middlewareController.verifyToken, adminController.addUser);

/**
 * @swagger
 * /admin/updateUser:
 *  post:
 *   summary: update user
 *   tags: [/admin]
 *   requestBody:
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             password:
 *               type: string
 *               description: password of user
 *             fullName:
 *               type: string
 *               description: full name of user
 *   security:
 *     - tokenAuth: []
 *   responses:
 *     '201':
 *       description: Update user successfully
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInfo'
 *     '500':
 *       description: Internal server error
 */
router.post('/updateUser', middlewareController.verifyToken, adminController.updateUser);

/**
 * @swagger
 * /admin/deleteUser:
 *  post:
 *   summary: delete user
 *   tags: [/admin]
 *   requestBody:
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *               description: id of the user
 *             
 *   security:
 *     - tokenAuth: []
 *   responses:
 *     '201':
 *       description: Delete user successfully
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInfo'
 *     '500':
 *       description: Internal server error
 */
router.delete('/deleteUser', middlewareController.verifyToken, adminController.deleteUser);

/**
 * @swagger
 * /admin/banUser:
 *  post:
 *   summary: ban user
 *   tags: [/admin]
 *   requestBody:
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *               description: id of the user
 *             banned:
 *               type: boolean
 *               description: ban or unban
 *             
 *   security:
 *     - tokenAuth: []
 *   responses:
 *     '200':
 *       description: Ban/Unban user successfully
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInfo'
 *     '500':
 *       description: Internal server error
 */
router.post('/banUser', middlewareController.verifyToken, adminController.banUser);

/**
 * @swagger
 * /admin/activeClass:
 *  post:
 *   summary: active/inactive class
 *   tags: [/admin]
 *   requestBody:
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             classId:
 *               type: string
 *               description: id of the class
 *             active:
 *               type: boolean
 *               description: active or inactive the class
 *             
 *   security:
 *     - tokenAuth: []
 *   responses:
 *     '200':
 *       description: Active/inactive class successfully
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Class'
 *     '500':
 *       description: Internal server error
 */

module.exports = router;