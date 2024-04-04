import { Request, Response } from 'express';
import { Salon } from "../entities/Salon";
import { Car } from "../entities/Car";
import { getRepository } from "typeorm";
const cloudinary = require("cloudinary").v2;
import jwt, { decode } from "jsonwebtoken";
import { getFileName } from "../utils/index"
import { User } from '../entities';

interface MulterFileRequest extends Request {
    files: {
        [fieldname: string]: { path: string, filename: string }[];
    };
}

const salonController = {
    getAllSalons: async (req: Request, res: Response) => {
        const salonRepository = getRepository(Salon);
        try {
            const salons = await salonRepository.find({});

            // const salons = await salonRepository.find({
            //     select: [
            //         "salon_id",
            //         "name",
            //         "image",
            //         "address",
            //     ]
            // });

            res.status(200).json({
                status: "success",
                salons: {
                    salons,
                    nbHits: salons.length,
                },
            });
        } catch (error) {
            return res.status(500).json({ status: "failed", msg: "Internal server error" });
        }
    },
    getSalonIdForUser: async (req: Request, res: Response) => {
        try {
            const user_id: any = req.headers['userId'] || "";

            const salon = await getRepository(Salon).findOne({
                where: {
                    user_id: user_id
                }
            });

            if (!salon) {
                return res.status(200).json({ status: "success", salonId: null, msg: 'Salon not found for the given userId' });
            }

            return res.status(200).json({ status: "success", salonId: salon.salon_id });
        } catch (error) {
            return res.status(500).json({ status: "failed", msg: 'Internal Server Error' });
        }
    },
    getSalonByUserId: async (req: Request, res: Response) => {
        const salonRepository = getRepository(Salon);
        const user_id: any = req.headers['userId'] || "";

        try {
            const salon = await salonRepository.findOne({
                where: {
                    user_id: user_id,
                },
                relations: ["cars"],
            })

            if (!salon) {
                return res.status(200).json({ status: "failed", msg: `No salon car found for user with id: ${user_id}` });
            }
            return res.status(200).json({
                status: "success",
                salon: salon
            });
        } catch (error) {
            return res.status(500).json({ status: "failed", msg: "Internal server error" });
        }
    },
    getSalonById: async (req: Request, res: Response) => {
        const salonRepository = getRepository(Salon);
        const { id } = req.params;

        try {
            const salon = await salonRepository.findOne({
                where: {
                    salon_id: id,
                },
                relations: ["cars"],
            })

            if (!salon) {
                return res.status(404).json({ status: "failed", msg: `No salon with id: ${id}` });
            }
            return res.status(200).json({
                status: "success",
                salon: salon
            });
        } catch (error) {
            return res.status(500).json({ status: "failed", msg: "Internal server error" });
        }
    },
    createSalon: async (req: Request | MulterFileRequest, res: Response) => {
        const salonRepository = getRepository(Salon);
        const { name, address, email, phoneNumber, introductionHtml, introductionMarkdown } = req.body;
        const user_id: any = req.headers['userId'] || "";

        let image = "", filenameImage = ""
        let banner = [""], filenameBanner = [""]

        if ('files' in req && req.files) {
            if (req.files["image"] && req.files["image"][0]) {
                const imageData = req.files["image"][0];
                image = imageData.path
                filenameImage = imageData.filename
            }

            if (req.files["banner"]) {
                const arrayImagesBanner = req.files["banner"];
                banner = arrayImagesBanner.map((obj) => obj.path);
                filenameBanner = arrayImagesBanner.map((obj) => obj.filename);
            }
        }

        try {
            const newSalon = { name, address, image, email, phoneNumber, banner, introductionHtml, introductionMarkdown, user_id };
            console.log(newSalon);
            const savedSalon = await salonRepository.save(newSalon);

            res.status(201).json({
                tatus: "success",
                msg: "Create successfully!",
                salon: savedSalon
            });
        } catch (error) {
            if (filenameImage !== "") {
                cloudinary.uploader.destroy(filenameImage)
            }
            if (filenameBanner.length !== 0) {
                filenameBanner.forEach(async (url) => {
                    cloudinary.uploader.destroy(url)
                })
            }
            return res.status(500).json({ status: "failed", msg: "Internal server error" });
        }
    },
    updateSalon: async (req: Request | MulterFileRequest, res: Response) => {
        const { id } = req.params;
        const { name, address, email, phoneNumber, introductionHtml, introductionMarkdown } = req.body;
        const salonRepository = getRepository(Salon);

        let image = "", filenameImage = ""
        let banner = null, filenameBanner = null
        if ('files' in req && req.files) {
            if (req.files["image"] && req.files["image"][0]) {
                const imageData = req.files["image"][0];
                image = imageData.path
                filenameImage = imageData.filename
            }

            if (req.files["banner"]) {
                const arrayImagesBanner = req.files["banner"];
                banner = arrayImagesBanner.map((obj) => obj.path);
                filenameBanner = arrayImagesBanner.map((obj) => obj.filename);
            }
        }

        let newSalon: any = { name, address, email, phoneNumber, introductionHtml, introductionMarkdown, }
        if (image !== "") newSalon.image = image;
        if (Array.isArray(banner) && banner.length > 0) newSalon.banner = banner;
        const { salon_id, user_id, ...other } = newSalon;

        const oldSalon = await salonRepository.findOne({
            where: {
                salon_id: id,
            },
        })

        if (!oldSalon) {
            if (filenameImage !== "") {
                cloudinary.uploader.destroy(filenameImage)
            }
            if (filenameBanner && filenameBanner.length !== 0) {
                filenameBanner.forEach(async (url) => {
                    cloudinary.uploader.destroy(url)
                })
            }
            return res.status(404).json({ status: "failed", msg: `No salon with id: ${id}` });
        }

        if (image !== "" && oldSalon.image) {
            cloudinary.uploader.destroy(getFileName(oldSalon.image));
        }

        if (banner && banner.length !== 0 && Array.isArray(oldSalon.banner) && oldSalon.banner.length > 0) {
            oldSalon.banner.forEach(banner => {
                cloudinary.uploader.destroy(getFileName(banner));
            });
        }

        try {
            const saveSalon = { ...oldSalon, ...other };
            const salon = await salonRepository.save(saveSalon);

            res.status(200).json({
                status: "success",
                msg: "Update successfully!",
                salon: salon
            });
        } catch (error) {
            if (filenameImage !== "") {
                cloudinary.uploader.destroy(filenameImage)
            }
            if (filenameBanner && filenameBanner.length !== 0) {
                filenameBanner.forEach(async (url) => {
                    cloudinary.uploader.destroy(url)
                })
            }
            return res.status(500).json({ status: "failed", msg: "Internal server error" });
        }
    },
    deleteSalon: async (req: Request, res: Response) => {
        const { id } = req.params;
        const salonRepository = getRepository(Salon);
        const carRepository = getRepository(Car);

        try {
            const salon = await salonRepository.findOne({
                where: {
                    salon_id: id,
                }
            })

            if (!salon) {
                return res.status(404).json({ status: "failed", msg: `No salon with id: ${id}` });
            }

            if (salon.image) {
                cloudinary.uploader.destroy(getFileName(salon.image));
            }

            if (Array.isArray(salon.banner) && salon.banner.length > 0) {
                salon.banner.forEach(banner => {
                    cloudinary.uploader.destroy(getFileName(banner));
                });
            }

            // Xóa các car tham chiếu đến salon
            await carRepository.delete({ salon: salon });
            await salonRepository.delete(id);
            res.status(200).json({
                status: "success",
                msg: "Delete successfully!"
            });
        } catch (error) {
            return res.status(500).json({ status: "failed", msg: "Internal server error" });
        }
    },

    verifyInviteFromNotification: async (req: Request, res: Response) => {
        const { token } = req.body;
        const userId: any = req.headers['userId'];
        let salonId = "";

        if (!token) {
            return res.json({
                status: "failed",
                "msg": "Token is invalid."
            })
        }

        jwt.verify(token, process.env.JWT_SECRETKEY_MAIL || "jwt_key_mail", async (err: any, decoded: any) => {
            if (err) {
                return res.json({
                    status: "failed",
                    msg: "error token."
                })
            }

            salonId = decoded.salonId;
        })

        try {
            // join salon.
            const salonRepository = getRepository(Salon);
            let salonDb: Salon | undefined = await salonRepository.findOneOrFail({
                where: { salon_id: salonId },
                relations: ['employees']
            });

            const userRepository = getRepository(User);
            let userDb: any = await userRepository.findOneOrFail({
                where: { user_id: userId }
            })
            userDb.password = ""; // error is delete here - CDQ.

            salonDb?.employees.push(userDb);
            await salonRepository.save(salonDb);

            return res.json({
                status: "success",
                msg: "join salon successfully!"
            })

        } catch (error) {
            console.log(error)
            return res.json({
                status: "failed",
                msg: "error with join salon."
            })
        }


    },

    getEmployees: async (req: Request, res: Response) => {
        const { salonId, userId } = req.body;
        const salonRepository = getRepository(Salon);

        try {
            const salonDb: any = await salonRepository.findOne({
                select: ['salon_id', 'name'],
                where: { salon_id: salonId },
                relations: ['employees'],
            })

            return res.json({
                status: "success",
                salonDb
            })
        } catch (error) {
            console.log(error)
            return res.json({
                status: "failed",
                msg: "error find salon."
            })
        }
    },

    handlePermission: async (req: Request, res: Response) => {
        const { permission, userId, isDelete } = req.body;
        const userRepository = getRepository(User);
        try {
            let userDb: User = await userRepository.findOneOrFail({
                where: {user_id: userId}
            })

            if(!isDelete) {
                userDb.permissions = !userDb.permissions?[permission]: [...userDb.permissions, permission];
            } else {
                userDb.permissions = userDb.permissions.filter(per => per !== permission)
            }

            await userRepository.save(userDb);

            console.log(userDb);

            return res.json({
                status: "success", 
                msg: "add permission successfully!",
                permissions: userDb.permissions
            })

        } catch (error) {
            console.log(error)
            return res.json({
                status: "failed",
                msg: "error with add permission."
            })
        }

    }

}

export default salonController;