const adminM = require("../models/admin.m");
const bcrypt = require("bcrypt");
const formidable = require('formidable');
const fs = require('fs');
const xlsx = require('xlsx');

const adminController = {
    getAllAccount: async (req, res) => {
        const rs = await adminM.getAllAccount();
        return res.status(200).json(rs);
    },

    addUser: async (req, res) => {
        try {
            // hash password
            const salt = await bcrypt.genSalt(11);
            const hashed = await bcrypt.hash(req.body.password, salt);

            // create new user
            const user = {
                email: req.body.email,
                password: hashed,
                full_name: req.body.fullName,
                address: req.body.address,
                phone_number: req.body.phoneNumber,
                activation: true,
            };
            const rs = await adminM.addAccount(user);
            if (!rs) {
                return res.json({
                    status: 'failed',
                    message: 'User already exists'
                }) 
            }
            return res.json({
                status: 'success',
                data: rs,
                message: 'Add user successfully'
            })

        } catch (err) {
            return res.json({
                status: 'failed',
                message: err
            })
        }
    },

    updateUser: async (req, res) => {
        try {
             

 
             // create new user
             const user = {
                 email: req.body.email,
                 full_name: req.body.fullName,
                 address: req.body.address,
                 phone_number: req.body.phoneNumber,
                 activation: true,
             };
             // hash password
             if (req.body.password !== '') {
                const salt = await bcrypt.genSalt(11);
                const hashed = await bcrypt.hash(req.body.password, salt);
                user.password = hashed;
             } else {
                user.password = null;
             }
            const rs = await adminM.updateAccount(user);
            return res.json({
                status: 'success',
                data: rs,
                message: 'Update user successfully'
            })

        } catch (err) {
            return res.json({
                status: 'failed',
                message: err
            })
        }
    },

    deleteUser: async (req, res) => {
        const userId = req.query.userId;
        if (userId === undefined) {
            return res.status(400).json({
                status: 'failed',
                error: 'Missing required input data',
            });
        }

        if (typeof userId !== 'string') {
            return res.status(400).json({
                status: 'failed',
                error: 'Invalid data types for input (userId should be string)',
            });
        }

        try {
            const rs = await adminM.deleteAccount(userId);
            return res.json({
                status: 'success',
                data: rs,
                message: 'Delete user successfully'
            })

        } catch (err) {
            return res.json({
                status: 'failed',
                message: err
            })
        }
    },

    banUser: async (req, res) => {
        const { userId, banned } = req.body;
        if (userId === undefined || banned === undefined) {
            return res.status(400).json({
                status: 'failed',
                error: 'Missing required input data',
            });
        }

        if (typeof userId !== 'string' || typeof banned !== 'boolean') {
            return res.status(400).json({
                status: 'failed',
                error: 'Invalid data types for input (userId should be string, banned should be boolean)',
            });
        }

        try {
            const rs = await adminM.banAccount(banned, userId);

            return res.json({
                status: 'success',
                data: rs,
                message: 'Ban user successfully'
            })

        } catch (err) {
            return res.json({
                status: 'failed',
                message: err
            })
        }
    },

    inactiveClass: async (req, res) => {
        const { active, classId } = req.body;
        if (active === undefined || classId === undefined) {
            return res.status(400).json({
                status: 'failed',
                error: 'Missing required input data',
            });
        }

        if (typeof active !== 'boolean' || typeof classId !== 'string') {
            return res.status(400).json({
                status: 'failed',
                error: 'Invalid data types for input (active should be boolean, classId should be string)',
            });
        }
        try {
            const rs = await adminM.activeClass(active, classId);
            return res.json({
                status: 'success',
                data: rs,
                message: 'Active class successfully'
            })

        } catch (err) {
            return res.json({
                status: 'failed',
                message: err
            })
        }
    },

    mapStudentId: async (req, res) => {
        const {userId, studentId} = req.body;
        console.log(userId, studentId);
        try {
            const rs = await adminM.mapStudenId(userId, studentId);
            if (rs === null) {
                return res.json({
                    status: 'failed',
                    message: 'Student id already exists' 
                })
            }
            return res.json({
                status: 'success',
                data: rs,
            })
        } catch (err) {
            return res.json({
                status: 'failed',
                message: err 
            })
        }
    },

    postStudentListId: async (req, res) => {
        let form = new formidable.IncomingForm();
        let data = []
        form.parse(req, async (err, fields, files) => {
        files.grades.forEach((file) => {
            const filePath = file.filepath;
            // Read the XLSX file
            const workbook = xlsx.readFile(filePath);
            const sheets = workbook.SheetNames

            for (let i = 0; i < sheets.length; i++) {
            const temp = xlsx.utils.sheet_to_json(
                workbook.Sheets[workbook.SheetNames[i]])
            temp.forEach((res) => {
                data.push(res)
            })
            }
        })
        const student_id_arr = data?.map((item) => item.StudentId)
        const user_id_arr = data?.map((item) => item.id)
        try {
            const data = {
            student_id_arr,
            user_id_arr
            };

            const postStudentListId = await adminM.postStudentListId(data);

            return res.status(200).json(postStudentListId);
        } catch (err) {
            return res.json({
            status: "failed",
            err: err,
            });
        }
        });
    },

    getTemplateStudentListId: async (req, res) => { 
        try {
            const csvData = await adminM.getTemplateStudentListId();
            return res.json({
                status: 'success',
                csvData
            })
        } catch (err) {
            return res.json({ 
                status: "failed",
                err: err,
            })
        }
    },

    getQuantityUserAndClass: async (req, res) => {
        try {
            const rs = await adminM.getQuantityUserAndClass();
            return res.json({
                status: 'success',
                data: rs
            })
        } catch (err) {
            return res.json({
                status: "failed",
                err: err,
            })
        }
     }
};

module.exports = adminController;
