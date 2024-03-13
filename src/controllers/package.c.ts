import { Request, Response } from 'express';
import { Package } from "../entities/Package";
import { getRepository } from "typeorm";
const cloudinary = require("cloudinary").v2;
import {isValidUUID, getFileName} from "../utils/index"

interface MulterFileRequest extends Request {
    file: any; // Adjust this to match the type of your uploaded file
}

const packageController = {
    getAllPackages: async (req: Request, res: Response) => {
        const packageRepository = getRepository(Package);
        try {
            const packages = await packageRepository.createQueryBuilder("package")
                .leftJoinAndSelect("package.features", "feature")
                .getMany();
    
            res.status(200).json({
                status: "success",
                data: {
                    packages: packages.map(pkg => ({
                        package_id: pkg.package_id,
                        name: pkg.name,
                        description: pkg.description,
                        price: pkg.price,
                        image: pkg.image,
                        features: pkg.features.map(feature => ({
                            feature_id: feature.feature_id,
                            name: feature.name,
                            description: feature.description
                        }))
                    })),
                    nbHits: packages.length,
                },
            });
        } catch (error) {
            return res.status(500).json({ msg: "Internal server error" });
        }
    },
    getPackageById: async (req: Request, res: Response) => {
        const { id } = req.params;
        const packageRepository = getRepository(Package);

        try {
            const packagee = await packageRepository.createQueryBuilder("package")
            .leftJoinAndSelect("package.features", "feature")
            .where("package.package_id = :id", { id: id })
            .getOne()
            if (!packagee) {
                return res.status(404).json({ msg: `No package with id: ${id}` });
            }
            res.status(200).json({
                status: "success",
                data: {
                    package: {
                        package_id: packagee.package_id,
                        name: packagee.name,
                        description: packagee.description,
                        price: packagee.price,
                        image: packagee.image,
                        features: packagee.features.map(feature => ({
                            feature_id: feature.feature_id,
                            name: feature.name,
                            description: feature.description
                        }))
                    }
                }
            });
        } catch (error) {
            return res.status(500).json({ msg: "Internal server error" });
        }
    },
    createPackage: async (req: Request | MulterFileRequest, res: Response) => {
        const { name, description, price, features } = req.body;
        const packageRepository = getRepository(Package);

        let image, filename = ""
        if ('file' in req && req.file) {
            image = req.file.path;
            filename = req.file.filename;
        }
    
        try {
            if (price < 0) {
                if(filename !== ""){
                    cloudinary.uploader.destroy(filename)
                }
                return res.status(400).json({ msg: "Price must be greater than or equal to 0" });
            }

            const newPackage = packageRepository.create({ name, description, price, image });
            const savedPackage = await packageRepository.save(newPackage);
            
            if(features && isValidUUID(features[0])){
                await packageRepository
                    .createQueryBuilder()
                    .relation(Package, "features")
                    .of(savedPackage)
                    .add(features);
            }

            res.status(201).json({ msg: "Package added successfully" });
        } catch (error) {
            if(filename !== ""){
                cloudinary.uploader.destroy(filename)
            }
            return res.status(500).json({ msg: "Internal server error" });
        }
    },
    updatePackage: async (req: Request | MulterFileRequest, res: Response) => {
        const { id } = req.params;
        const { name, description, price, features } = req.body;
        const packageRepository = getRepository(Package);
        
        const oldPackage = await packageRepository.findOne({
            where: {
                package_id: id,
            },
        })

        let image, filename = ""
        if ('file' in req && req.file) {
            image = req.file.path;
            filename = req.file.filename;
        }
        
        if(!oldPackage){
            if(filename !== ""){
                cloudinary.uploader.destroy(filename)
            }
            return res.status(404).json({ msg: `No package with id: ${id}` });
        }
        if(oldPackage.image){
            cloudinary.uploader.destroy(getFileName(oldPackage.image));
        }
        
        try {
            if (price < 0) {
                if(filename !== ""){
                    cloudinary.uploader.destroy(filename)
                }
                return res.status(400).json({ msg: "Price must be greater than or equal to 0" });
            }

            const packageDataToUpdate: any = {};
            if (name) packageDataToUpdate.name = name;
            if (description) packageDataToUpdate.description = description;
            if (price) packageDataToUpdate.price = price;
            if (image) packageDataToUpdate.image = image;

            if (Object.keys(packageDataToUpdate).length > 0) {
                await packageRepository.update(id, packageDataToUpdate);
            }
            const result = await packageRepository.findOne({
                where: {
                    package_id: id,
                },
                relations: ["features"], 
            })

            if (features && result) {
                await packageRepository
                    .createQueryBuilder()
                    .relation(Package, "features")
                    .of(result)
                    .remove(result.features);
                if(isValidUUID(features[0])){
                    await packageRepository
                    .createQueryBuilder()
                    .relation(Package, "features")
                    .of(result)
                    .add(features);
                }
            }
            res.status(200).json({ msg: "Package updated successfully" });
        } catch (error) {
            if(filename !== ""){
                cloudinary.uploader.destroy(filename)
            }
            return res.status(500).json({ msg: "Internal server error" });
        }
    },
    deletePackage: async (req: Request, res: Response) => {
        const { id } = req.params;
        const packageRepository = getRepository(Package);
        try {
            const packagee = await packageRepository.delete(id);
            if (packagee.affected === 0) {
                return res.status(404).json({ msg: `No package with id: ${id}` });
            }
            res.status(200).json({ msg: "Success" });
        } catch (error) {
            return res.status(500).json({ msg: "Internal server error" });
        }
    },

    buyPackage:  async (req: Request, res: Response) => {

    },

}

export default packageController;