import { Request, Response } from 'express';
import { getRepository } from "typeorm";
import { User } from '../entities';
import parsePermission from '../helper/parsePermission';


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
        

        try {
            const adminDb: User = await adminRepository.findOneOrFail({
                where: { user_id: process.env.USER_ID_ADMIN_TEAM, role: "admin" }
            })

            
        } catch (error) {
            
        }
    }

}

export default adminController;