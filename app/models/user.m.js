const db = require("../../config/connect_db");
const {v4 : uuidv4} = require('uuid')

module.exports = {
  getUsers: async () => {
    const rs = await db.any("SELECT * FROM users");
    return rs;
  },
  addUser: async (user) => {
    const rs = await db.one("INSERT INTO users (id, email, password, full_name) VALUES ($1, $2, $3, $4) RETURNING *;", [uuidv4(), user.email, user.password, user.fullName]);
    return rs;
  },
  updateUserByEmail: async (user) => {
    try {
      const rs = await db.one("UPDATE users SET full_name = $2, password = $3 WHERE email = $1 RETURNING *;", 
      [ user.email, user.fullName, user.password]);
      return rs;
    } catch (err) {
      console.log("Error in updateUser in user.m: ", err);
      return null;
    }
  },
  getUserByEmail: async (email) => { 
    try {
      const rs = await db.one("SELECT * FROM users WHERE email = $1;", [email]);
      return rs;
    } catch (err) {
      if (err.code === 0) {
        return null;
      } else {
        throw err;
      }
    }
  },
  getUserByID: async (id) => {
    try {
      const rs = await db.one("SELECT * FROM users WHERE id = $1;", [id]);
      return rs;
    } catch (err) {
      if (err.code === 0) {
        return null;
      } else {
        throw err;
      }
    }
  },
  updateProfile: async (user) => {
    try {
      const rs = await db.one("UPDATE users SET full_name = $2, address = $3, phone_number = $4 WHERE id = $1 RETURNING *;", 
      [ user.id, user.full_name, user.address, user.phone_number]);
      return rs;
    } catch (err) {
      console.log("Error in updateProfile in user.m: ", err);
      return null;
    }
  },
  changePassword: async (user) => {
    try {
      const rs = await db.one("UPDATE users SET password = $2 WHERE email = $1 RETURNING *;", [user.email, user.password]);
      return rs;
    } catch (err) {
      console.log("Error in changePassword in user.m: ", err);
      return null;
    }
  },
  activeUser: async (user) => {
    try {
      const rs = await db.one("UPDATE users SET activation = $2 WHERE email = $1 RETURNING *;", [user.email, true]);
      return rs;
    } catch (err) {
      console.log("Error in activeUser in user.m: ", err);
      return null;
    }
  },
  postStudentId: async (userId, studentId) => {
    try {
      const rs = await db.one("INSERT INTO student_id (user_id, student_id) VALUES ($1, $2) RETURNING *;", [userId, studentId]);
      return rs;
    } catch (err) {
      console.log("Error in postStudentId in user.m: ", err);
      return null;
    }
  },
  getStudentId: async (userId) => {
    try {
      const rs = await db.one("SELECT * FROM student_id WHERE user_id = $1;", [userId]);
      return rs;
    } catch (err) {
      if (err.code === 0) {
        return null;
      } else {
        throw err;
      }
    }
  },
  getFullNameOfUser: async (userId) => {
    try {
      const rs = await db.one("SELECT * FROM users WHERE id = $1;", [userId]);
      return rs;
    } catch (err) {
      if (err.code === 0) {
        return null;
      } else {
        throw err;
      }
    }
  }
};
