import { Request, Response } from 'express';
import { Car } from "../entities/Car";
import { getRepository } from "typeorm";
import { Invoice, Salon } from '../entities';


const invoiceController = {
    printInvoiceBuyCar: async (req: Request, res: Response) => {
        const {carId, salonId, note, fullname, email, phone} = req.body;

        try {
            const invoiceRepository = getRepository(Invoice);
            const carRepository = getRepository(Car);
            const carDb: Car = await carRepository.findOneOrFail({
                where: {car_id: carId},
                relations: ['salon', 'warranties']
            })

            if (carDb.salon?.salon_id !== salonId) {
                return res.json({
                    status: "failed",
                    msg: "Error information."
                })
            }

            let saveInvoice: any = new Invoice();
            saveInvoice.seller = carDb.salon;
            saveInvoice = {...saveInvoice, expense: carDb.price, note, fullname, email, phone, carName: carDb.name};
            await invoiceRepository.save(saveInvoice);

            return res.json({
                status: "success",
                msg: "Create invoice successfully!",
                invoice: {...saveInvoice, warranty: carDb?.warranties}
            })

        } catch (error) {
            console.log(error)
            return res.json({
                status: "failed",
                msg: "Can not create the invoice."
            })
        }
    },

    lookupInvoiceByInvoiceId: async (req: Request, res: Response) => {
        const {salonId, invoiceId, phone: phone, licensePlate, type} = req.body;

        try {
            const invoiceRepository = getRepository(Invoice);
            let invoiceDb: any = await invoiceRepository.find({
                where: {invoice_id: invoiceId, phone, licensePlate, type},
                relations: ['seller']
            })
            
            invoiceDb = invoiceDb.filter((invoice: any) => invoice?.seller?.salon_id === salonId)

            return res.json({
                status: "success",
                msg: "Look up successfully!",
                invoice: invoiceDb
            })

        } catch (error) {
            console.log(error)
            return res.json({
                status: "failed",
                msg: "Error look up invoice."
            })
        }
    },

    getAllInvoiceOfSalon: async (req: Request, res: Response) => {
        const {salonId} = req.body;

        try {
            const invoiceRepository =getRepository(Invoice);
            let invocieDb: any = await invoiceRepository
                .createQueryBuilder('invoice')
                .innerJoinAndSelect('invoice.seller', 'salon', 'salon.salon_id = :salonId', { salonId })
                .getMany();

            return res.json({
                status: "success",
                invoices: invocieDb
            })
        } catch (error) {
            return res.json({
                status: "failed",
                msg: "Error get all invoice for salon."
            })
        }
    }
}

export default invoiceController;