import { Request, Response } from 'express';
import { Salon } from "../entities/Salon";
import { Car } from "../entities/Car";
import { getRepository } from "typeorm";
const cloudinary = require("cloudinary").v2;
import { getFileName } from "../utils/index"

// interface MulterFile {
//     path: string;
//     filename: string;
// }

// interface MulterFileRequest extends Request {
//     files?: MulterFile[];
// }

interface MulterFileRequest extends Request {
    files: {
        //[fieldname: string]: Express.Multer.File[];
        //[fieldname: string]: any;
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
                data: {
                salons,
                nbHits: salons.length,
                },
            });
        } catch (error) {
            return res.status(500).json({ msg: "Internal server error" });
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
                return res.status(404).json({ msg: `No salon with id: ${id}` });
            }
            return res.status(200).json(salon);
        } catch (error) {
            return res.status(500).json({ msg: "Internal server error" });
        }
    },
    createSalon: async (req: Request | MulterFileRequest, res: Response) => {
        const salonRepository = getRepository(Salon);
        const { name, address, email, phoneNumber, introductionHtml, introductionMarkdown} = req.body;

        let image = "", filenameImage = ""
        let banner = [""], filenameBanner = [""]

        if ('files' in req && req.files) {
            if(req.files["image"] && req.files["image"][0]){
                const imageData = req.files["image"][0];
                image = imageData.path
                filenameImage = imageData.filename
            }

            if(req.files["banner"]){
                const arrayImagesBanner = req.files["banner"];
                banner = arrayImagesBanner.map((obj) => obj.path);
                filenameBanner = arrayImagesBanner.map((obj) => obj.filename);
            }
        }
        
        try {

            const newSalon = salonRepository.create({ name, address, image, email, phoneNumber, banner, introductionHtml, introductionMarkdown });
            const savedSalon = await salonRepository.save(newSalon);

            res.status(201).json({ salon: savedSalon });
        } catch (error) {
            if(filenameImage !== ""){
                cloudinary.uploader.destroy(filenameImage)
            }
            if(filenameBanner.length !== 0){
                filenameBanner.forEach(async (url) => {
                    cloudinary.uploader.destroy(url)
                })
            }
            return res.status(500).json({ msg: "Internal server error" });
        }
    },
    updateSalon: async (req: Request | MulterFileRequest, res: Response) => {
        const { id } = req.params;
        const { name, address, email, phoneNumber, introductionHtml, introductionMarkdown} = req.body;
        const salonRepository = getRepository(Salon);

        const oldSalon = await salonRepository.findOne({
            where: {
                salon_id: id,
            },
        })

        let image = "", filenameImage = ""
        let banner = null, filenameBanner = null

        if ('files' in req && req.files) {
            if(req.files["image"] && req.files["image"][0]){
                const imageData = req.files["image"][0];
                image = imageData.path
                filenameImage = imageData.filename
            }

            if(req.files["banner"]){
                const arrayImagesBanner = req.files["banner"];
                banner = arrayImagesBanner.map((obj) => obj.path);
                filenameBanner = arrayImagesBanner.map((obj) => obj.filename);
            }
        }

        if(!oldSalon){
            if(filenameImage !== ""){
                cloudinary.uploader.destroy(filenameImage)
            }
            if(filenameBanner && filenameBanner.length !== 0){
                filenameBanner.forEach(async (url) => {
                    cloudinary.uploader.destroy(url)
                })
            }
            return res.status(404).json({ msg: `No salon with id: ${id}` });
        }

        if(image !== "" && oldSalon.image){
            cloudinary.uploader.destroy(getFileName(oldSalon.image));
        }

        if (banner && banner.length !== 0 && Array.isArray(oldSalon.banner) && oldSalon.banner.length > 0) {
            oldSalon.banner.forEach(banner => {
                cloudinary.uploader.destroy(getFileName(banner));
            });
        }
        
        try {
            const salonDataToUpdate: any = {};

            if (name) salonDataToUpdate.name = name;
            if (address) salonDataToUpdate.address = address;
            if (image) salonDataToUpdate.image = image;
            if (email) salonDataToUpdate.email = email;
            if (phoneNumber) salonDataToUpdate.phoneNumber = phoneNumber;
            if (banner) salonDataToUpdate.banner = banner;
            if (introductionHtml) salonDataToUpdate.introductionHtml = introductionHtml;
            if (introductionMarkdown) salonDataToUpdate.introductionMarkdown = introductionMarkdown;
            

            let salon = {}

            if (Object.keys(salonDataToUpdate).length > 0) {
                salon = await salonRepository.update(id, salonDataToUpdate);
            }
            
            if ('affected' in salon && salon.affected === 0) {
                return res.status(404).json({ msg: `No salon with id: ${id}` });
            }

            const result = await salonRepository.findOne({
                where: {
                    salon_id: id,
                }})
            res.status(200).json({ result });
        } catch (error) {
            if(filenameImage !== ""){
                cloudinary.uploader.destroy(filenameImage)
            }
            if(filenameBanner && filenameBanner.length !== 0){
                filenameBanner.forEach(async (url) => {
                    cloudinary.uploader.destroy(url)
                })
            }
            return res.status(500).json({ msg: "Internal server error" });
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
                return res.status(404).json({ msg: `No salon with id: ${id}` });
            }
            // Xóa các car tham chiếu đến salon
            await carRepository.delete({ salon: salon });
            
            await salonRepository.delete(id);
            res.status(200).json({ msg: "Success" });
        } catch (error) {
            return res.status(500).json({ msg: "Internal server error" });
        }
    },
}

export default salonController;