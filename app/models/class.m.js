const db = require("../../config/connect_db");
const {v4 : uuidv4 } = require('uuid');
require('dotenv').config();
const generateRandomCode = require('../../utils/index')

module.exports = {
    addClass: async (class_info) => {
        const invitation = `${process.env.URL_CLIENT}/invite/${generateRandomCode(8)}`;
        const rs = await db.one("INSERT INTO classes (id, owner_id, name, description, invitation) VALUES ($1, $2, $3, $4, $5) RETURNING *;", [uuidv4(), class_info.owner_id, class_info.name, class_info.description, invitation]);
        return rs;
    },
    
    getClasses: async () => {
        const rs = await db.any("SELECT * FROM classes;");
        return rs;
    },

    getClass: async(id) => {
        const rs = await db.one("SELECT * FROM classes WHERE id = $1;", [id]);
        return rs;
    },

    getIdClassByComposition: async (composition_id) => {
        const rs = await db.one("SELECT * FROM classes_composition WHERE id = $1;", [composition_id]);
        return rs;
    },

    updateClassInfo: async(class_info) => {
        const rs = await db.one("UPDATE classes SET name = $2, description = $3, invitation = $4 WHERE id = $1 RETURNING *;", [class_info.id, class_info.name, class_info.description, class_info.invitation]);
        return rs;
    },

    addUserToClass: async(id_class, id_user, role, student_id = null) => {
        const rs = await db.one("INSERT INTO class_user (id_class, id_user, role, student_id) VALUES ($1, $2, $3, $4) RETURNING *;", [id_class, id_user, role, student_id]);
        return rs;
    },

    getClassesByUserId: async(id_user) => {
        const rs = await db.any("SELECT * FROM classes c JOIN class_user cu ON c.id = cu.id_class WHERE cu.id_user = $1 AND c.inactive = false;", [id_user]);
        return rs;
    },

    getAllUserFromClass: async (id_class) => { 
        const rs = await db.any("SELECT * FROM class_user WHERE id_class = $1;", [id_class]);
        return rs;
    },

    getClassByLink: async(link) => {
        const rs = await db.any("SELECT * FROM classes WHERE invitation = $1;", [link]);
        return rs;
    },

    checkTeacherByTeacherClassId: async(teacherId, classId) => {
        const rs = await db.any("SELECT * FROM class_user WHERE id_class = $2 AND id_user = $1;", [teacherId, classId]);
        return rs;
    },

    getUserOfClassById: async (class_id, user_id) => {
        const rs = await db.any("SELECT * FROM class_user WHERE id_class = $1 AND id_user = $2;", [class_id, user_id]);
        return rs;
    },

    checkTeacherOfClassById: async (class_id, user_id) => { 
        const rs = await db.any("SELECT * FROM class_user WHERE id_class = $1 AND id_user = $2 AND role = $3;", [class_id, user_id, 'teacher']);
        return rs;
    },

    addUserToStudentList: async (student_id, class_id, full_name, ismap) => {
        const rs = await db.one(`INSERT INTO student_list (student_id, class_id, full_name, ismap)
        VALUES ($1, $2, $3, $4) RETURNING*;`, [student_id, class_id, full_name, ismap])
        return rs; 
    }
}