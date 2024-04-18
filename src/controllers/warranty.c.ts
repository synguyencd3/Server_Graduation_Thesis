import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Car, Salon, Warranty } from "../entities";

const warrantyController = {
    createNewWarranty: async (req: Request, res: Response) => {
        const { salonId, name, reuse, limit_kilometer, months, policy, carId } = req.body;

        try {
            const warrantyRepository = getRepository(Warranty);
            let saveWarranty = new Warranty();

            // find car by carId
            if (carId) {
                const carRepository = getRepository(Car);
                const carDb: Car = await carRepository.findOneOrFail({
                    where: { car_id: carId }
                })
                saveWarranty.car = [carDb];
            }

            // find salon by salonId
            const salonRepository = getRepository(Salon);
            saveWarranty.salon = await salonRepository.findOneOrFail({
                where: { salon_id: salonId }
            })

            // save new warranty.
            await warrantyRepository.save({ ...saveWarranty, name, reuse, limit_kilometer, months, policy });

            return res.json({
                status: "success",
                msg: "create new warranty successfully!"
            })
        } catch (error) {
            console.log(error)
            return res.json({
                status: "failed",
                msg: "Error create new warranty."
            })
        }
    },

    getWarrantyForSalon: async (req: Request, res: Response) => {
        const { salonId, warrantyId } = req.body;

        try {
            const warrantyRepository = getRepository(Warranty);
            let warrantyDb: any = await warrantyRepository
                .createQueryBuilder('warranty')
                .innerJoinAndSelect('warranty.salon', 'salon', 'salon.salon_id = :salonId', { salonId });

            if (warrantyId)
                warrantyDb = warrantyDb
            .where({ warranty_id: warrantyId })

            const rs = await warrantyDb.getMany();

            return res.json({
                status: "success",
                warranties: rs
            })
        } catch (error) {
            console.log(error)
            return res.json({
                status: "failed",
                msg: "Error find the warranty.",
                error
            })
        }
    },

    test:  async (req: Request, res: Response) => {
        const carRepository = getRepository(Car);
        const { id } = req.params;

        try {
            const car = await carRepository.findOne({
                where: {
                    car_id: id,
                },
                relations: ['salon', 'warranties'],
            })
            if (!car) {
                return res.status(404).json({ status: "failed", msg: `No car with id: ${id}` });
            }
            const { salon_id, name, address } = car.salon;

            return res.status(200).json({
                status: "success",
                car: {
                    ...car,
                    salon: {
                        salon_id,
                        name,
                        address
                    }
                }
            });
        } catch (error) {
            return res.status(500).json({ status: "failed", msg: "Internal server error" });
        }
    },

    pushWarrantyCar: async (req: Request, res: Response) => {
        const {warrantyId, carId} = req.body;

        try {
            const warrantyRepository = getRepository(Warranty);
            let warrantyDb: Warranty = await warrantyRepository.findOneOrFail({
                where: {warranty_id: warrantyId},
                relations: ['car']
            })

            const carRepository = getRepository(Car);
            const carDb: Car = await carRepository.findOneOrFail({
                where: {car_id: carId}
            })

            if (warrantyDb?.car) {
                warrantyDb.car.push(carDb);
                
            } else {
                warrantyDb.car = [carDb];
            }

            await warrantyRepository.save(warrantyDb);

            return res.json({
                status: "success", 
                msg: "pushed the warranty for car successfully!"
            })
        } catch (error) {
            return res.json({
                status: "failed",
                msg: "pushed the warranty for car failed."
            })
        }
    }

};

export default warrantyController;
