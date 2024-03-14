import { Request, Response } from 'express';
import { Car } from "../entities/Car";
import { getRepository } from "typeorm";
const cloudinary = require("cloudinary").v2;
import { getFileName } from "../utils/index"

interface MulterFile {
    path: string;
    filename: string;
}

interface MulterFileRequest extends Request {
    files?: MulterFile[];
}

const carController = {
    getAllCars: async (req: Request, res: Response) => {
        const carRepository = getRepository(Car);
        try {
            const cars = await carRepository.find({});

            // const cars = await carRepository.find({
            //     select: [
            //         "name",
            //         "price",
            //         "image",
            //         "origin",
            //         "type",
            //         "capacity"
            //     ]
            // });
    
            // cars.forEach(car => {
            //     if (car.image && car.image.length > 0) {
            //         car.image = [car.image[0]];
            //     }
            // });

            res.status(200).json({
                status: "success",
                data: {
                cars,
                nbHits: cars.length,
                },
            });
        } catch (error) {
            return res.status(500).json({ msg: "Internal server error" });
        }
    },
    getCarById: async (req: Request, res: Response) => {
        const carRepository = getRepository(Car);
        const { id } = req.params;

        try {
            const car = await carRepository.findOne({
                where: {
                    car_id: id,
                }})
            if (!car) {
                return res.status(404).json({ msg: `No car with id: ${id}` });
            }
            return res.status(200).json(car);
        } catch (error) {
            return res.status(500).json({ msg: "Internal server error" });
        }
    },
    getAllCarsByBrand: async (req: Request, res: Response) => {
        const { brand } = req.params;
        const carRepository = getRepository(Car);

        try {
            const cars = await carRepository.find({
                where: {
                    brand: brand
                },
            });

            res.status(200).json({
                status: "success",
                data: {
                    cars,
                    nbHits: cars.length,
                },
            });
        } catch (error) {
            return res.status(500).json({ msg: "Internal server error" });
        }
    },
    createCar: async (req: Request | MulterFileRequest, res: Response) => {
        const carRepository = getRepository(Car);
        const { name, description, origin, price, brand, 
            model, type, capacity, door, seat, kilometer,
            gear, mfg, inColor, outColor} = req.body;

        let image = [""], filename = [""]
        if ('files' in req && req.files) {
            const arrayImages = req.files;
            image = arrayImages.map((obj) => obj.path);
            filename = arrayImages.map((obj) => obj.filename);
        }

        try {
            if (price < 0) {
                if(filename.length !== 0){
                    filename.forEach(async (url) => {
                        cloudinary.uploader.destroy(url)
                    })
                }
                return res.status(400).json({ msg: "Price must be greater than or equal to 0" });
            }

            const newCar = carRepository.create({ name, description, origin, price, brand, 
            model, type, capacity, door, seat, kilometer,
            gear, mfg, inColor, outColor, image });
            const savedCar = await carRepository.save(newCar);

            res.status(201).json({ car: savedCar });
        } catch (error) {
            if(filename.length !== 0){
                filename.forEach(async (url) => {
                    cloudinary.uploader.destroy(url)
                })
            }
            return res.status(500).json({ msg: "Internal server error" });
        }
    },
    updateCar: async (req: Request | MulterFileRequest, res: Response) => {
        const { id } = req.params;
        const { name, description, origin, price, brand, 
            model, type, capacity, door, seat, kilometer,
            gear, mfg, inColor, outColor} = req.body;
        const carRepository = getRepository(Car);

        const oldCar = await carRepository.findOne({
            where: {
                car_id: id,
            },
        })

        let image = null, filename = null
        if ('files' in req && req.files) {
            const arrayImages = req.files;
            image = arrayImages.map((obj) => obj.path);
            filename = arrayImages.map((obj) => obj.filename);
        }

        if(!oldCar){
            if(filename && filename.length !== 0){
                filename.forEach(async (url) => {
                    cloudinary.uploader.destroy(url)
                })
            }
            return res.status(404).json({ msg: `No car with id: ${id}` });
        }

        if (image && image.length !== 0 && Array.isArray(oldCar.image) && oldCar.image.length > 0) {
            oldCar.image.forEach(image => {
                cloudinary.uploader.destroy(getFileName(image));
            });
        }
        
        try {
            if (price < 0) {
                if(filename && filename.length !== 0){
                    filename.forEach(async (url) => {
                        cloudinary.uploader.destroy(url)
                    })
                }
                return res.status(400).json({ msg: "Price must be greater than or equal to 0" });
            }

            const carDataToUpdate: any = {};

            if (name) carDataToUpdate.name = name;
            if (description) carDataToUpdate.description = description;
            if (origin) carDataToUpdate.origin = origin;
            if (price) carDataToUpdate.price = price;
            if (brand) carDataToUpdate.brand = brand;
            if (model) carDataToUpdate.model = model;
            if (type) carDataToUpdate.type = type;
            if (capacity) carDataToUpdate.capacity = capacity;
            if (door) carDataToUpdate.door = door;
            if (seat) carDataToUpdate.seat = seat;
            if (kilometer) carDataToUpdate.kilometer = kilometer;
            if (gear) carDataToUpdate.gear = gear;
            if (mfg) carDataToUpdate.mfg = mfg;
            if (inColor) carDataToUpdate.inColor = inColor;
            if (outColor) carDataToUpdate.outColor = outColor;
            if (image) carDataToUpdate.image = image;

            let car = {}

            if (Object.keys(carDataToUpdate).length > 0) {
                car = await carRepository.update(id, carDataToUpdate);
            }
            
            if ('affected' in car && car.affected === 0) {
                return res.status(404).json({ msg: `No car with id: ${id}` });
            }

            const result = await carRepository.findOne({
                where: {
                    car_id: id,
                }})
            res.status(200).json({ result });
        } catch (error) {
            if(filename && filename.length !== 0){
                filename.forEach(async (url) => {
                    cloudinary.uploader.destroy(url)
                })
            }
            return res.status(500).json({ msg: "Internal server error" });
        }
    },
    deleteCar: async (req: Request, res: Response) => {
        const { id } = req.params;
        const carRepository = getRepository(Car);
        try {
            const car = await carRepository.delete(id);
            if (car.affected === 0) {
                return res.status(404).json({ msg: `No car with id: ${id}` });
            }
            res.status(200).json({ msg: "Success" });
        } catch (error) {
            return res.status(500).json({ msg: "Internal server error" });
        }
    },
}

export default carController;