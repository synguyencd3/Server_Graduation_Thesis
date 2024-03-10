import { Request, Response } from 'express';
import { Package } from "../entities/Package";
import { getRepository } from "typeorm";


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
    createPackage: async (req: Request, res: Response) => {
        const { name, description, price, features } = req.body;
        const packageRepository = getRepository(Package);
        try {
            const newPackage = packageRepository.create({ name, description, price });
            const savedPackage = await packageRepository.save(newPackage);

            await packageRepository
                .createQueryBuilder()
                .relation(Package, "features")
                .of(savedPackage)
                .add(features);
        res.status(201).json({ msg: "Package added successfully" });
        } catch (error) {
            return res.status(500).json({ msg: "Internal server error" });
        }
    },
    updatePackage: async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name, description, price, features } = req.body;
        const packageRepository = getRepository(Package);
        try {
            const updatedPackage = await packageRepository.update(id, { name, description, price});
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

                await packageRepository
                    .createQueryBuilder()
                    .relation(Package, "features")
                    .of(result)
                    .add(features);
            }
            if (updatedPackage.affected === 0) {
                 return res.status(404).json({ msg: `No feature with id: ${id}` });
            }
            res.status(200).json({ msg: "Package updated successfully" });
        } catch (error) {
            console.log(error);
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