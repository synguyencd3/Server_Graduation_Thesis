import { Request, Response } from 'express';
import { Feature } from "../entities/Feature";
import { getRepository } from "typeorm";


const featureController = {
    getAllFeatures: async (req: Request, res: Response) => {
        const featureRepository = getRepository(Feature);
        try {
            const features = await featureRepository.find({});

            res.status(200).json({
                status: "success",
                data: {
                features,
                nbHits: features.length,
                },
            });
        } catch (error) {
            return res.status(500).json({ msg: "Internal server error" });
        }
    },
    getFeatureById: async (req: Request, res: Response) => {
        const featureRepository = getRepository(Feature);
        const { id } = req.params;

        try {
            const feature = await featureRepository.findOne({
                where: {
                    feature_id: id,
                }})
            if (!feature) {
                return res.status(404).json({ msg: `No feature with id: ${id}` });
            }
            return res.status(200).json(feature);
        } catch (error) {
            console.error("Error retrieving feature:", error);
            return res.status(500).json({ msg: "Internal server error" });
        }
    },
    createFeature: async (req: Request, res: Response) => {
        const featureRepository = getRepository(Feature);
        const { name, description } = req.body;
        try {
            const newFeature = featureRepository.create({ name, description });
            const savedFeature = await featureRepository.save(newFeature);
            res.status(201).json({ feature: savedFeature });
        } catch (error) {
            return res.status(500).json({ msg: "Internal server error" });
        }
    },
    updateFeature: async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name, description } = req.body;
        const featureRepository = getRepository(Feature);
        try {
            const feature = await featureRepository.update(id, { name, description });
            if (feature.affected === 0) {
                return res.status(404).json({ msg: `No feature with id: ${id}` });
            }
            const result = await featureRepository.findOne({
                where: {
                    feature_id: id,
                }})
            res.status(200).json({ result });
        } catch (error) {
            return res.status(500).json({ msg: "Internal server error" });
        }
    },
    deleteFeature: async (req: Request, res: Response) => {
        const { id } = req.params;
        const featureRepository = getRepository(Feature);
        try {
            const feature = await featureRepository.delete(id);
            if (feature.affected === 0) {
                return res.status(404).json({ msg: `No feature with id: ${id}` });
            }
            res.status(200).json({ msg: "Success" });
        } catch (error) {
            return res.status(500).json({ msg: "Internal server error" });
        }
    }
}

export default featureController;