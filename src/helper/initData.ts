import bcrypt from "bcrypt";
import dotenv from 'dotenv';
import { getRepository } from 'typeorm';
import { User, Permission } from "../entities";

dotenv.config({ path: './server/.env' });

export const initAdminTeam = async () => {
    // init data
    const userRepository = getRepository(User);
    const user = new User();
    const salt = await bcrypt.genSalt(11);
    user.user_id = process.env.USER_ID_ADMIN_TEAM||"";
    user.username = process.env.USERNAME_ADMIN_TEAM||"";
    user.password = await bcrypt.hash(process.env.PASSWORD_ADMIN_TEAM||"", salt);
    user.role = "admin";

    // add full permission for the admin.
    const permissionRepository = getRepository(Permission);
    const permissionDb = await permissionRepository.find();
    console.log("PMSDB: ", permissionDb)
    let permissionAdmin = [];
    for (const per of permissionDb) {
      permissionAdmin.push(`C_${per.key}`);
      permissionAdmin.push(`R_${per.key}`);
      permissionAdmin.push(`U_${per.key}`);
      permissionAdmin.push(`D_${per.key}`);
    }

    user.permissions = permissionAdmin;

    try {
      await userRepository.save(user);
      console.log("init admin account successfully!");
      // init permission
    } catch (error) { console.log("ERROR INIT DB: ", error)}
}

export const initPermission = async (key: string, name: string) => {
    const permissionRepository = getRepository(Permission);
    let permission = new Permission();
    permission.key = key;
    permission.name = name;
    try {
        await permissionRepository.save(permission);
        console.log(`init permission ${key} - ${name} successfully!`);
      } catch (error) { console.log(`ERROR INIT permission  ${key} - ${name}: `, error)} 
}