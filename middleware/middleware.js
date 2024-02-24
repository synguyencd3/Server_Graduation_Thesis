const jwt = require("jsonwebtoken");
const classModel = require("../app/models/class.m")
const userModel = require("../app/models/user.m")

const middlewareController = {
  // verify token
  verifyToken: (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
      const accessToken = token.split(" ")[1];
      jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
        if (err) {
          return res.status(403).json("Token isn't valid!");
        }
        req.user = user;
        next();
      });
    } else {
      return res.status(401).json("You're not authenticated!");
    }
  },

  isTeacherOfClass: async (req, res, next) => {
    const emailSend = req.body.emailSend;
    const id_class = req.body.classId;

    try {
      // find id teacher by email
      const userDb = await userModel.getUserByEmail(emailSend);

      const roleInClass = await classModel.checkTeacherByTeacherClassId(userDb.id, id_class);

      if (roleInClass[0].role == "teacher" || roleInClass[0].role == 'teacher') {
        next()
      } else {
        return res.status(403).json("You are not teacher of this class.");
      }
      
    } catch (error) {
      console.log(error)
      return res.status(403).json("Invite error.");
    }

  },

  isAdminGet: async (req, res, next) => {
    const userId = req.query.userId;

    try {
      const userDb = await userModel.getUserByID(userId);

      if (userDb.role === 'admin') {
        next();
      } else {
        return res.status(403).json("You are not admin.");
      }
    } catch (error) { 
      console.log(error);
      return res.status(403).json("Occur error");
    }
  },

  isAdminPost: async (req, res, next) => {
    const userId = req.body.userId;

    try {
      const userDb = await userModel.getUserByID(userId);

      if (userDb.role === 'admin') {
        next();
      } else {
        return res.status(403).json("You are not admin.");
      }
    } catch (error) { 
      console.log(error);
      return res.status(403).json("Occur error");
    }
  },

};

module.exports = middlewareController;
