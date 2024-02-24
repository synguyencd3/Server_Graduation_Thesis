const db = require("../../config/connect_db");
const {v4 : uuidv4 } = require('uuid');

require("dotenv").config();

module.exports = {
  getGradeComposition: async (class_id, student_id, composition_id) => {
    try {
      const rs = await db.one(
        "SELECT * FROM classes_grades WHERE class_id = $1 AND student_id = $2 AND composition_id = $3;",
        [class_id, student_id, composition_id]
      );
      const isRequest = await db.oneOrNone(`
      SELECT * FROM grades_reviews
      WHERE student_id = $1 AND composition_id = $2;
      `, [student_id, composition_id])
      return {
        isRequest,
        ...rs
      };
    } catch (err) {
      console.log(err);
      if (err.code === 0) {
        return null;
      } else {
        throw err;
      }
    }
  },

  postRequestCompositionReview: async (student_id, composition_id, student_expected_grade, student_explain, content, link) => {
    try {
      console.log(student_id, composition_id, student_expected_grade, student_explain, content, link);
      const currentGrade = await db.oneOrNone(`SELECT grade 
      FROM classes_grades 
      WHERE student_id = $1 AND composition_id = $2;`, [student_id, composition_id])
      const rs = await db.one(
        `INSERT INTO grades_reviews (id, student_id, composition_id,current_grade, student_expected_grade, student_explain) 
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [uuidv4(), student_id, composition_id,currentGrade?.grade ?? null, student_expected_grade, student_explain]
      );


      const teacherList = await db.any(
        `
        SELECT us.id
        FROM users us
        JOIN class_user cu ON us.id = cu.id_user
        JOIN classes_composition cc ON cu.id_class = cc.class_id
        WHERE cu.role = 'teacher' AND cc.id = $1;
      `, [composition_id]);

      for (const teacher of teacherList) {
        const makeNotification = await db.any(
          `
          INSERT
          INTO teacher_notifications (notification_id, teacher_id, notification_type, content, link)
          VALUES ($1, $2, $3, $4, $5);
        `, [uuidv4(), teacher.id, `RequestCompositionReview ${rs.id}`, content, link]);
      }

      return {
        rs: rs,
        teacherList: teacherList,
      };
    } catch (err) {
      if (err.code === 0) {
        return null;
      } else {
        throw err;
      }
    }
  },

  commentGradeReview: async (composition_id, feedback, content, link) => {
    try {
      const rs = await db.one(
        "UPDATE grades_reviews SET feedback = feedback || $2::jsonb WHERE composition_id = $1 RETURNING *",
        [composition_id, feedback]
      );

      const teacherList = await db.any(
        `
        SELECT us.id
        FROM users us
        JOIN class_user cu ON us.id = cc.id_user
        JOIN classes_composition cc ON cu.id_class = cc.class_id
        WHERE cu.role = 'teacher' AND cc.id = $1;
      `, [composition_id]);

      for (const teacher of teacherList) {
        const makeNotification = await db.any(
          `
          INSERT
          INTO teacher_notifications (notification_id, teacher_id, notification_type, content, link)
          VALUES ($1, $2, $3, $4, $5);
        `, [uuidv4(), teacher.id, `CommentGradeReview ${rs.id}`, content, link]);
      }

      return {
        rs: rs,
        teacherList: teacherList,
      };
    } catch (err) {
      if (err.code === 0) {
        return null;
      } else {
        throw err;
      }
    }
  },
  

  getCommentReview: async (id) => {
    try {
      const rs = await db.any(
        "SELECT feedback FROM grades_reviews WHERE id = $1;",
        [id]
      );
      return rs;
    } catch (err) {
      if (err.code === 0) {
        return null;
      } else {
        throw err;
      }
    }
  },
  
  getAllNotificationsByStudentId: async (studentId) => {
    try {
      const rs = await db.any("SELECT * FROM student_notifications WHERE teacher_id = $1;", [studentId]);
      return rs;
    } catch (err) {
      if (err.code === 0) {
        return null;
      } else {
        throw err;
      }
    }
  },

  getAllNotificationsByUserId: async (userId) => {
    try {
      const rs = await db.any("SELECT * FROM student_notifications WHERE student_notifications.student_id = $1 UNION ALL SELECT * FROM teacher_notifications WHERE teacher_notifications.teacher_id = $1;", [userId]);
      return rs;
    } catch (err) {
      if (err.code === 0) {
        return null;
      } else {
        throw err;
      }
    }
  },

};
