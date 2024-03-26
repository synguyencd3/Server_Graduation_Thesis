import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Appointment, User } from '../entities';
import createNotification from '../helper/createNotification';

const appointmentController = {
  createAppointment: async (req: Request, res: Response) => {
    const userId: any = req.headers['userId'];
    const { salonId, date, description}: any = req.body;

    try {
      const appointmentRepository = getRepository(Appointment);
      let appoint = new Appointment();
      appoint.salon_id = salonId;
      appoint.user_id = userId;
      appoint.date = date;
      appoint.description = description;
      await appointmentRepository.save(appoint);
      createNotification({
        to: salonId,
        description: "you have a new appointment.",
        types: "appointment"
      })

      return res.status(201).json({
        status: "success",
        msg: "Create appointment successfully!",
        appoint
      });
    } catch (error) {
      return res.status(400).json({
        status: "failed",
        msg: "Invalid informations."
      })
    }
  },

  get: async (req: Request, res: Response) => {
    const userId: any = req.headers['userId'] || req.body.userId;
    const { salonId, status, id }: any = req.body;
    const appointmentRepository = getRepository(Appointment)

    try {
      let appointDb: any = await appointmentRepository.find({
        where: { salon_id: salonId, status: status, id: id, user_id: userId },
        relations: ['user', 'salon'],
        select: ['id', 'date', 'description', 'status', 'user', 'salon'],
        order: { create_at: 'DESC' }
      })

      for (let app in appointDb) {
        appointDb[app].user = {fullname: appointDb[app].user.fullname, phone: appointDb[app].user.phone};
        appointDb[app].salon = appointDb[app].salon.name;
      }
  
      return res.status(200).json({
        status: "success",
        appointments: appointDb
      })
    } catch (error) {
      console.log(error)
      return res.status(400).json({
        status: "failed",
        msg: "invaid information."
      })
    }

  },

  // if user => login, salon => is admin of salon.
  updateOne: async (req: Request, res: Response) => {
    const userId: any = req.headers['userId'];
    // console.log(userId)
    const { salonId, id }: any = req.body;
    let description: any = !userId? undefined: req.body.description;
    let status: any = !userId? req.body.status:undefined;
    const updateObject: Object = { id: id, user_id: userId, salon_id: salonId}
    const filteredObject: any = Object.fromEntries(Object.entries(updateObject).filter(([key, value]) => value !== undefined));
    const appointmentRepository = getRepository(Appointment)

    try {
      const appointDb = await appointmentRepository.findOneOrFail({
        where: filteredObject
      });
      await appointmentRepository.save({...appointDb, status, description});

      return res.status(200).json({
        status: "success",
        msg: "Updated successfully!"
      })

    } catch (error) {
      // console.log(error)
      return res.status(404).json({
        status: "failed",
        msg: "Update error."
      })
    }
  },

  delete: async (req: Request, res: Response) => {
    const userId: any = req.headers['userId'] || req.body.userId;
    const { salonId, status, id }: any = req.body;
    const deleteObject: Object = { id: id, user_id: userId, salon_id: salonId, status: status}
    const filteredObject = Object.fromEntries(Object.entries(deleteObject).filter(([key, value]) => value !== undefined));
    const notifiRepository = getRepository(Appointment)
    try {
      await notifiRepository.delete(filteredObject);
      // console.log(filteredObject)
      return res.status(200).json({
        status: "success",
        msg: "delete successfully!"
      })
    } catch (error) {
      return res.status(404).json({
        status: "failed",
        msg: "delete error."
      })
    }
  },

};

export default appointmentController;
