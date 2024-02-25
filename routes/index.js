const authRouter = require("./auth.r");

function router(app) {
  /**
   * @swagger
   *  components:
   *    schemas:
   *      UserInfo:
   *        type: object
   *        properties:
   *          id:
   *            type: string
   *            description: user's id
   *          email:
   *            type: string
   *            description: user's email
   *          fullName:
   *            type: string
   *            description: user's name
   *          address:
   *            type: string
   *            description: user's address
   *          phone_number:
   *            type: string
   *            description: user's phone number
   *          role:
   *            type: string
   *            description: user's role (teacher or student)
   *          activation:
   *            type: boolean
   *            description: login state
   *      Class:
   *        type: object
   *        properties:
   *          id:
   *            type: string
   *            description: class's id
   *          name:
   *            type: string
   *            description: name of the class
   *          description:
   *            type: string
   *            description: detail about class
   *          invitation:
   *            type: string
   *            description: invitation link to attend class
   *      ClassWithUser:
   *        type: object
   *        properties:
   *          id_class:
   *            type: string
   *            description: class's id
   *          id_user:
   *            type: string
   *            description: user's id
   *          role:
   *            type: string
   *            description: role of user in class (teacher or student)
   *    securitySchemes:
   *      cookieAuth:
   *        type: apiKey
   *        in: cookie
   *        name: refreshToken
   *      tokenAuth:
   *        type: apiKey
   *        in: header
   *        name: authorization
   */

  app.use("/auth", authRouter);
}

module.exports = router;
