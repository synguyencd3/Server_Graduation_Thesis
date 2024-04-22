import { Request, Response } from "express";
import { Maintenance } from "../entities/Maintenance";
import { Invoice } from "../entities/Invoice";
import { MInvoiceDetail } from "../entities/MInvoiceDetail";
import { User } from "../entities/User";
import { getRepository, In } from "typeorm";
import { formatDate } from "../utils/index";
import moment from "moment";

const maintainController = {
  getAllMaintenanceInvoices: async (req: Request, res: Response) => {
    const userId: any = req.headers["userId"] || "";
    const mInvoicesRepository = getRepository(Invoice);
    const maintainRepository = getRepository(Maintenance);
    const mInvoiceDetailRepository = getRepository(MInvoiceDetail);
    let salonId = "";

    try {
      const user = await getRepository(User).findOne({
        where: { user_id: userId },
        relations: ["salonId"],
      });

      if (user?.salonId) salonId = user.salonId.salon_id;
      else {
        return res.status(403).json({
          status: "failed",
          msg: "You do not have sufficient permissions",
        });
      }

      const mInvoices = await mInvoicesRepository.find({
        where: { type: "maintenance", seller: { salon_id: salonId } },
        relations: ["seller"],
      });

      // Tình danh sách các dịch vụ đã dùng
      const serviceCodes = mInvoices
        .map((invoice) => invoice.maintenanceServices)
        .flat();

      // Tìm dịch vụ đó bao gồm tên và giá
      const services = await maintainRepository.find({
        where: { maintenance_id: In(serviceCodes) },
      });

      const invoiceDetails = await mInvoiceDetailRepository.find({
        where: {
          invoice_id: In(mInvoices.map((invoice) => invoice.invoice_id)),
        },
      });

      const mInvoicesWithServices = mInvoices.map((invoice) => {
        const detailedServices = invoice.maintenanceServices.map((code) => {
          const service = services.find((s) => s.maintenance_id === code);
          const invoiceDetail = invoiceDetails.find(
            (detail) =>
              detail.invoice_id === invoice.invoice_id &&
              detail.maintenance_id === code
          );

          if (service && invoiceDetail) {
            return {
              name: service.name,
              cost: service.cost,
              quantity: invoiceDetail.quantity,
            };
          }
        });

        return {
          invoice_id: invoice.invoice_id,
          fullname: invoice.fullname,
          email: invoice.email,
          phone: invoice.phone,
          licensePlate: invoice.licensePlate,
          carName: invoice.carName,
          invoiceDate: formatDate(invoice.create_at),
          total: invoice.expense,
          salon: {
            salon_id: invoice.seller.salon_id,
            name: invoice.seller.name,
          },
          note: invoice.note,
          maintenanceServices: detailedServices,
        };
      });

      return res.status(200).json({
        status: "success",
        invoices: mInvoicesWithServices,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "failed",
        msg: "Internal server error",
      });
    }
  },
  getMaintenanceInvoiceById: async (req: Request, res: Response) => {
    const mInvoicesRepository = getRepository(Invoice);
    const maintainRepository = getRepository(Maintenance);
    const mInvoiceDetailRepository = getRepository(MInvoiceDetail);

    const { id } = req.params;

    try {
      const mInvoice = await mInvoicesRepository.findOne({
        where: { invoice_id: id, type: "maintenance" },
        relations: ["seller"],
      });

      if (!mInvoice) {
        return res.status(404).json({
          status: "failed",
          msg: `No maintenance invoices with id: ${id}`,
        });
      }

      const serviceCodes = mInvoice.maintenanceServices;

      const services = await maintainRepository.find({
        where: { maintenance_id: In(serviceCodes) },
      });

      const invoiceDetails = await mInvoiceDetailRepository.find({
        where: { invoice_id: id },
      });

      const detailedServices = services.map((service) => {
        const invoiceDetail = invoiceDetails.find(
          (detail) => detail.maintenance_id === service.maintenance_id
        );

        if (invoiceDetail) {
          return {
            name: service.name,
            cost: service.cost,
            quantity: invoiceDetail.quantity,
          };
        }
      });

      const invoice = {
        invoice_id: mInvoice.invoice_id,
        fullname: mInvoice.fullname,
        email: mInvoice.email,
        phone: mInvoice.phone,
        licensePlate: mInvoice.licensePlate,
        carName: mInvoice.carName,
        invoiceDate: formatDate(mInvoice.create_at),
        total: mInvoice.expense,
        salon: {
          salon_id: mInvoice.seller.salon_id,
          name: mInvoice.seller.name,
        },
        note: mInvoice.note,
        maintenanceServices: detailedServices,
      };

      return res.status(200).json({
        status: "success",
        invoice: invoice,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ status: "failed", msg: "Internal server error" });
    }
  },
  findMaintenanceInvoicesByLicensePlate: async (
    req: Request,
    res: Response
  ) => {
    const userId: any = req.headers["userId"] || "";
    const { licensePlate } = req.params;
    const mInvoiceRepository = getRepository(Invoice);
    const maintainRepository = getRepository(Maintenance);
    const mInvoiceDetailRepository = getRepository(MInvoiceDetail);
    let salonId = "";

    try {
      const user = await getRepository(User).findOne({
        where: { user_id: userId },
        relations: ["salonId"],
      });

      if (user?.salonId) salonId = user.salonId.salon_id;
      else {
        return res.status(403).json({
          status: "failed",
          msg: "You do not have sufficient permissions",
        });
      }

      const mInvoices = await mInvoiceRepository.find({
        where: {
          licensePlate,
          type: "maintenance",
          seller: { salon_id: salonId },
        },
        relations: ["seller"],
      });

      if (mInvoices.length === 0) {
        return res.status(404).json({
          status: "failed",
          msg: "No maintenance invoices found for this license plate",
        });
      }

      const serviceCodes = mInvoices
        .map((invoice) => invoice.maintenanceServices)
        .flat();

      const services = await maintainRepository.find({
        where: { maintenance_id: In(serviceCodes) },
      });

      const invoiceDetails = await mInvoiceDetailRepository.find({
        where: {
          invoice_id: In(mInvoices.map((invoice) => invoice.invoice_id)),
        },
      });

      const mInvoicesWithServices = mInvoices.map((invoice) => {
        const detailedServices = invoice.maintenanceServices.map((code) => {
          const service = services.find((s) => s.maintenance_id === code);
          const invoiceDetail = invoiceDetails.find(
            (detail) =>
              detail.invoice_id === invoice.invoice_id &&
              detail.maintenance_id === code
          );

          if (service && invoiceDetail) {
            return {
              name: service.name,
              cost: service.cost,
              quantity: invoiceDetail.quantity,
            };
          }
        });

        return {
          invoice_id: invoice.invoice_id,
          fullname: invoice.fullname,
          phone: invoice.phone,
          email: invoice.email,
          carName: invoice.carName,
          invoiceDate: formatDate(invoice.create_at),
          total: invoice.expense,
          // salon: {
          //   salon_id: invoice.seller.salon_id,
          //   name: invoice.seller.name,
          // },
          note: invoice.note,
          maintenanceServices: detailedServices,
        };
      });

      return res.status(200).json({
        status: "success",
        invoices: mInvoicesWithServices,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        msg: "Internal server error",
      });
    }
  },
  createMaintenanceInvoices: async (req: Request, res: Response) => {
    const userId: any = req.headers["userId"] || "";
    const mInvoicesRepository = getRepository(Invoice);
    const { licensePlate, carName, services, note, fullname, email, phone } =
      req.body;
    let salonId = "";
    let expense = 0;

    try {
      const serviceIds = services.map((service: any) => service.maintenance_id);
      const maintenanceServices = serviceIds;
      const dbServices = await getRepository(Maintenance).find({
        where: { maintenance_id: In(serviceIds) },
      });

      for (const service of services) {
        const dbService = dbServices.find(
          (s) => s.maintenance_id === service.maintenance_id
        );
        if (dbService) {
          expense += dbService.cost * service.quantity;
        }
      }

      const user = await getRepository(User).findOne({
        where: { user_id: userId },
        relations: ["salonId"],
      });

      if (user?.salonId) salonId = user.salonId.salon_id;
      else {
        return res.status(403).json({
          status: "failed",
          msg: "You do not have sufficient permissions",
        });
      }

      const newMaintain = {
        licensePlate,
        carName,
        create_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
        seller: { salon_id: salonId },
        maintenanceServices,
        expense,
        note,
        type: "maintenance",
        fullname,
        email,
        phone,
      };

      const savedMaintenanceInvoice = await mInvoicesRepository.save(
        newMaintain
      );

      const mInvoiceDetailRepository = getRepository(MInvoiceDetail);
      for (const service of services) {
        const mInvoiceDetail = new MInvoiceDetail();

        mInvoiceDetail.invoice_id = savedMaintenanceInvoice.invoice_id;
        mInvoiceDetail.maintenance_id = service.maintenance_id;
        mInvoiceDetail.quantity = service.quantity;

        await mInvoiceDetailRepository.save(mInvoiceDetail);
      }

      return res.status(201).json({
        status: "success",
        msg: "Create successfully!",
        maintain: savedMaintenanceInvoice,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        msg: "Internal server error",
      });
    }
  },
  updateMaintenanceInvoices: async (req: Request, res: Response) => {
    const mInvoicesRepository = getRepository(Invoice);
    const mInvoiceDetailRepository = getRepository(MInvoiceDetail);
    const { id } = req.params;
    const { licensePlate, carName, services, note } = req.body;

    try {
      const serviceIds = services.map((service: any) => service.maintenance_id);
      const maintenanceServices = serviceIds;

      const mInvoice = await mInvoicesRepository.findOne({
        where: { invoice_id: id, type: "maintenance" },
      });

      if (!mInvoice) {
        return res.status(404).json({
          status: "failed",
          msg: `No maintenance invoice with id: ${id}`,
        });
      }

      mInvoice.licensePlate = licensePlate;
      mInvoice.carName = carName;
      mInvoice.note = note;
      mInvoice.maintenanceServices = maintenanceServices;

      await mInvoiceDetailRepository.delete({ invoice_id: id });

      let total = 0;
      for (const service of services) {
        const { maintenance_id, quantity } = service;

        const mInvoiceDetail = new MInvoiceDetail();
        mInvoiceDetail.invoice_id = id;
        mInvoiceDetail.maintenance_id = maintenance_id;
        mInvoiceDetail.quantity = quantity;
        await mInvoiceDetailRepository.save(mInvoiceDetail);

        const dbService = await getRepository(Maintenance).findOne({
          where: { maintenance_id: maintenance_id },
        });
        if (dbService) {
          total += dbService.cost * quantity;
        }
      }

      mInvoice.expense = total;
      await mInvoicesRepository.save(mInvoice);

      const result = await mInvoicesRepository.findOne({
        where: {
          invoice_id: id,
        },
      });

      return res.status(200).json({
        status: "success",
        msg: "Update successfully!",
        maintain: result,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ status: "failed", msg: "Internal server error" });
    }
  },
  deleteMaintenanceInvoices: async (req: Request, res: Response) => {
    const { id } = req.params;
    const mInvoicesRepository = getRepository(Invoice);
    const mInvoiceDetailRepository = getRepository(MInvoiceDetail);
    try {
      const mInvoice = await mInvoicesRepository.delete(id);
      if (mInvoice.affected === 0) {
        return res.status(404).json({
          status: "failed",
          msg: `No maintenance invoices with id: ${id}`,
        });
      }
      await mInvoiceDetailRepository.delete({ invoice_id: id });

      res.status(200).json({
        status: "success",
        msg: "Delete successfully!",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ status: "failed", msg: "Internal server error" });
    }
  },
};

export default maintainController;
