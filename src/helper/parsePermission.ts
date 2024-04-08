import { getRepository } from "typeorm";
import { Permission } from '../entities';

const parsePermission = async (data: any) => {
    const permissionsRepository = getRepository(Permission);
    const permissionsDb = await permissionsRepository.find();

    let rs: any = {};
    for (const keys of data) {
        let [keyMethod, keyFeature, description, method] = keys.split("_");
        for (const per of permissionsDb) {
            if (keyFeature === per.key) description = per.name;
        }
        switch (keyMethod) {
            case "C": method = "Có quyền thêm "; break;
            case "R": method = "Có quyền xem thông tin "; break;
            case "U": method = "Có quyền cập nhật "; break;
            case "D": method = "Có quyền xóa "; break;
        }
        let newMethod = method + description;
        rs[description] = { ...rs[description], [keys]: newMethod }
    }

    return rs;
}

export default parsePermission;
