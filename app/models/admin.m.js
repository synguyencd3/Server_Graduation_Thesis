const userM = require('./user.m')
const db = require("../../config/connect_db");
const {v4 : uuidv4} = require('uuid')
require('dotenv').config();

module.exports = {
    getAllAccount: async () => {
        try {
            const rs = db.any(`
            SELECT * FROM users u
            LEFT JOIN student_id s ON u.id = s.user_id;
            `)
            return rs;
        } catch (err) {
            console.log('Error in getAllAccount', err);
            return null;
        }
    },

    addAccount: async (user) => {
        try {
           const rs = await db.one(
            `INSERT INTO users (id, email, password, full_name, address, phone_number, activation)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING*;`,
            [uuidv4(), user.email, user.password, user.full_name, user.address, user.phone_number, user.activation]
           )
           return rs;
        } catch (err) {
            console.error('Error in addAccount', err);;
            return null;
        }
    },

    updateAccount: async (user) => { 
        try {
            if (user.password) {
                const rs = await db.one(`UPDATE users 
                SET full_name = $2, password = $3, address = $4, phone_number = $5
                WHERE email = $1 RETURNING *;`, 
                [ user.email, user.full_name, user.password, user.address, user.phone_number]);
                return rs;
            } 
            else {
                const rs = await db.one(`UPDATE users 
                SET full_name = $2, address = $3, phone_number = $4
                WHERE email = $1 RETURNING *;`, 
                [ user.email, user.full_name, user.address, user.phone_number]);
                return rs;
            }
            
         } catch (err) {
             console.error('Error in updateAccount', err);;
             return null;
         }
    },

    deleteAccount: async (userId) => { 
        try {
            const rs = await db.one(`
            DELETE FROM users 
            WHERE id = $1 RETURNING*;
            `, [userId]);
            await db.one(`
            DELETE FROM student_id 
            WHERE user_id = $1 RETURNING*;
            `, [userId]);
            return rs;
        } catch (err) {
            console.error('Error in deleteAccount', err);
            return null;
        }
    },

    banAccount: async (banned, userId) => {
        try {
            const rs = await db.one(`
            UPDATE users SET banned = $1
            WHERE id = $2 RETURNING*;
            `, [banned, userId]);
            return rs;
        } catch (err) {
            console.error('Error in banAccount', err);;
            return null;
        }
    },

    activeClass: async (active, classId) => {
        try {
            const rs = await db.one(`
            UPDATE classes SET inactive = $1
            WHERE id = $2 RETURNING*;
            `, [active, classId]);
            return rs;
        } catch (err) {
            console.error('Error in banAccount', err);;
            return null;
        }
    },

    mapStudenId: async (user_id, student_id) => {
        try {
            const rs = await db.one(`
            INSERT INTO student_id (user_id, student_id) VALUES ($1, $2) 
            ON CONFLICT (user_id) 
            DO UPDATE SET student_id = $2
            WHERE student_id.user_id = $1 RETURNING*;
            `, [user_id, student_id]);
            return rs;
        } catch (err) {
            console.error('Error in mapStudenId', err);;
            return null;
        }
    },

    postStudentListId: async (data) => {
        try {
            const updateListStudent = [];
            for (const [index, studentId] of data.student_id_arr.entries()) {
              const hasUser = await userM.getUserByID(data.user_id_arr[index]);
              if (hasUser) {
                const rs = await db.none(`
                INSERT INTO student_id (user_id, student_id) values ($1, $2) 
                ON CONFLICT (student_id, user_id) DO NOTHING;
                `, [data.user_id_arr[index].toString(),studentId.toString()] )
                updateListStudent.push(rs);
              }
            }
            return updateListStudent;
          } catch (error) {
            console.error("Error posting csv of student list:", error);
            return null;
          }
    },

    getTemplateStudentListId: async () => {
        try {
            const rs = await db.any(`
            SELECT u.id as id, u.email as "Email", s.student_id as "StudentId" FROM users u
            LEFT JOIN student_id s ON u.id = s.user_id;
            `)
            return rs;
        } catch (err) {
            console.log('Error in getTemplateStudentListId', err);
            return null;
        }
    },

    getQuantityUserAndClass: async () => { 
        try {
            const rs = [];
            const quantity_User = await db.one(`
            SELECT count(*) FROM users;
            `);
            const quantity_Class = await db.one(`
            SELECT count(*) FROM classes;
            `);
            const quantity_User_Active = await db.one(`
            SELECT count(*) FROM users WHERE activation = 'true';`);
            const quantity_Class_Active = await db.one(`
            SELECT count(*) FROM classes WHERE inactive = 'true';`);
            const quantity_User_ban = await db.one(`
            SELECT count(*) FROM users WHERE banned = 'true';`);
            rs.push({
                total: quantity_User,
                active: quantity_User_Active,
                ban: quantity_User_ban

            })
            rs.push({
                total: quantity_Class,
                active: quantity_Class_Active,
                ban: null
            })
            return rs;
        } catch (err)
        {
            console.log('Error in getQuantityUserAndClass', err);
            return null;
        }
    }


 }