import { Request, Response } from 'express';
import { getRepository } from "typeorm";
import { User, Permission } from '../entities';


const adminController = {
    getPermission: async (req: Request, res: Response) => {
        const adminRepository = getRepository(User);
        const permissionsRepository = getRepository(Permission);
        try {
            const adminDb = await adminRepository.findOneOrFail({
                where: { user_id: process.env.USER_ID_ADMIN_TEAM, role: "admin" },
                select: ['permissions']
            })

            const permissionsDb = await permissionsRepository.find();

            let rs: any = {};
            for (const keys of adminDb?.permissions) {
                let [keyMethod, keyFeature, description, method] = keys.split("_");
                for (const per of permissionsDb) {
                    if(keyFeature === per.key) description = per.name;
                }
                switch (keyMethod){
                    case "C": method = "Có quyền thêm "; break;
                    case "R": method = "Có quyền xem thông tin "; break;
                    case "U": method = "Có quyền cập nhật "; break;
                    case "D": method = "Có quyền xóa "; break;
                }
                let newMethod = method + description;
                rs[description] = {...rs[description], [keys]: newMethod}
            }

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
    }

}

export default adminController;