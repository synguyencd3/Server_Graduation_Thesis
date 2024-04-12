import { Request, Response } from 'express';
import { getRepository } from "typeorm";
// import { Permission, User } from '../entities';
import { User, Package, Feature, Car, Salon, Notification, Purchase, Message, Conversation, Appointment, Permission } from '../entities';
import parsePermission from '../helper/parsePermission';
import path from 'path';

const adminController = {
    getPermission: async (req: Request, res: Response) => {
        const adminRepository = getRepository(User);
        try {
            const adminDb = await adminRepository.findOneOrFail({
                where: { user_id: process.env.USER_ID_ADMIN_TEAM, role: "admin" },
                select: ['permissions']
            })
            const rs: any = await parsePermission(adminDb?.permissions);

            return res.json({
                status: "success",
                rs
            })
        } catch (error) {
            console.log(error)
            return res.json({
                status: "failed",
                msg: "error with find permissions array."
            })
        }
    }, 

    updatePermission: async (req: Request, res: Response) => {
        const {key, name, method} = req.body;
        const adminRepository = getRepository(User);

        if (!key || !name || !method)
            return res.json({
                status: "failed",
                msg: "Input invalid."
            })

        try {
            // save key - name for permission.
            let newPermission = new Permission()
            const permissionRepository = getRepository(Permission);
            newPermission.key = key;
            newPermission.name = name;
            await permissionRepository.save(newPermission);
            let adminDb: User = await adminRepository.findOneOrFail({
                where: { user_id: process.env.USER_ID_ADMIN_TEAM, role: "admin" }
            });

            // delete all method in permission.
            for (let m of ["C", "R", "U", "D"])
                adminDb.permissions = adminDb.permissions.filter((p) => p!= `${m}_${key}`);

            // add new method belong to key permission
            for (let m of method)
                adminDb.permissions.push(`${m}_${key}`);
                        
            await adminRepository.save(adminDb);

            return res.json({
                status: "success",
                msg: "Update permission sucessfully!",
                permissions: await parsePermission(adminDb.permissions)
            });
            
        } catch (error) {
            return res.json({
                status: "failed",
                msg: "error with update permisison."
            })
        }
    },

    getLogs: async (req: Request, res: Response) => {
        const salonId = req.body.salonId;
        const filePath = path.join(__dirname, `../logs/${salonId}.txt`);

        return res.sendFile(filePath);
    },

}

export default adminController;