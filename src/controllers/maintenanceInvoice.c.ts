import { Request, Response } from "express";
import { Maintenance } from "../entities/Maintenance";
import { Invoice } from "../entities/Invoice";
import { MInvoiceDetail } from "../entities/MInvoiceDetail";
import { User } from "../entities/User";
import { getRepository, In } from "typeorm";
import { formatDate } from "../utils/index";
import moment from "moment";
import {
  getUserInfo,
  getMaintenanceServiceList,
  getMaintenanceInvoice,
  getMaintenanceInvoiceList,
  getMaintenanceInvoiceDetails,
  getMaintenanceInvoiceDetailsList,
  formatMaintenanceInvoice,
  formatMaintenanceInvoiceList,
  getAccessoryList,
  getAccessoryInvoiceDetails,
  getAccessoryInvoiceDetailsList,
} from "../helper/mInvoice";
import { AInvoiceDetail, Accessory } from "../entities";

const maintainController = {
  getAllMaintenanceInvoices: async (req: Request, res: Response) => {
    const userId: any = req.headers["userId"] || "";

    try {
      const user = await getUserInfo(userId);

      if (!user?.salonId && !user?.phone) {
        return res.status(403).json({
          status: "failed",
          msg: "You do not have sufficient permissions",
        });
      }

      let mInvoices;

      if (user?.salonId) {
        const salonId = user.salonId.salon_id;
        mInvoices = await getMaintenanceInvoiceList(salonId);
      } else {
        const phone = user.phone;
        mInvoices = await getRepository(Invoice).find({
          where: { type: "maintenance", phone: phone },
          relations: ["seller"],
        });
      }

      // Tình danh sách các dịch vụ đã dùng
      const serviceCodes = mInvoices
        .map((invoice) => invoice.maintenanceServices)
        .flat();

      // Tìm các phụ tùng đã dùng
      const accessoryCodes = mInvoices
        .map((invoice) => invoice.accessories)
        .flat();

      // Tìm dịch vụ đó bao gồm tên và giá
      const mServices = await getMaintenanceServiceList(serviceCodes);

      // Tìm vật dụng đó bao gồm tên và giá
      const aServices = await getAccessoryList(accessoryCodes);

      const mInvoiceIds = mInvoices.map((invoice) => invoice.invoice_id);
      const mInvoiceDetails = await getMaintenanceInvoiceDetailsList(
        mInvoiceIds
      );

      const aInvoiceIds = mInvoices.map((invoice) => invoice.invoice_id);
      const aInvoiceDetails = await getAccessoryInvoiceDetailsList(aInvoiceIds);

      const mInvoicesWithServices = formatMaintenanceInvoiceList(
        mInvoices,
        mServices,
        mInvoiceDetails,
        aServices,
        aInvoiceDetails
      );

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
    const { id } = req.params;

    try {
      const mInvoice = await getMaintenanceInvoice(id);

      if (!mInvoice) {
        return res.status(404).json({
          status: "failed",
          msg: `No maintenance invoices with id: ${id}`,
        });
      }

      const mServiceCodes = mInvoice.maintenanceServices;
      const mServices = await getMaintenanceServiceList(mServiceCodes);

      const accessoryCodes = mInvoice.accessories;
      const aServices = await getAccessoryList(accessoryCodes);

      const mInvoiceDetails = await getMaintenanceInvoiceDetails(id);
      const aInvoiceDetails = await getAccessoryInvoiceDetails(id);

      const formattedInvoice = formatMaintenanceInvoice(
        mInvoice,
        mServices,
        mInvoiceDetails,
        aServices,
        aInvoiceDetails
      );

      return res.status(200).json({
        status: "success",
        invoice: formattedInvoice,
      });
    } catch (error) {
      console.log(error);
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
    const accessoryRepository = getRepository(Accessory);
    const mInvoiceDetailRepository = getRepository(MInvoiceDetail);
    const aInvoiceDetailRepository = getRepository(AInvoiceDetail);
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

      let mInvoices;

      if (user?.salonId) {
        const salonId = user.salonId.salon_id;
        mInvoices = await mInvoiceRepository.find({
          where: {
            licensePlate,
            type: "maintenance",
            seller: { salon_id: salonId },
          },
          relations: ["seller"],
        });
      } else {
        const phone = user.phone;
        mInvoices = await getRepository(Invoice).find({
          where: { type: "maintenance", phone: phone },
          relations: ["seller"],
        });
      }

      if (mInvoices.length === 0) {
        return res.status(404).json({
          status: "failed",
          msg: "No maintenance invoices found for this license plate",
        });
      }

      const mServiceCodes = mInvoices
        .map((invoice) => invoice.maintenanceServices)
        .flat();

      const mServices = await maintainRepository.find({
        where: { maintenance_id: In(mServiceCodes) },
      });

      const aServiceCodes = mInvoices
        .map((invoice) => invoice.accessories)
        .flat();

      const aServices = await accessoryRepository.find({
        where: { accessory_id: In(aServiceCodes) },
      });

      const mInvoiceDetails = await mInvoiceDetailRepository.find({
        where: {
          invoice_id: In(mInvoices.map((invoice) => invoice.invoice_id)),
        },
      });

      const aInvoiceDetails = await aInvoiceDetailRepository.find({
        where: {
          invoice_id: In(mInvoices.map((invoice) => invoice.invoice_id)),
        },
      });

      // const mInvoicesWithServices = mInvoices.map((invoice) => {
      //   const mDetailedServices = invoice.maintenanceServices.map((code) => {
      //     const service = mServices.find((s) => s.maintenance_id === code);
      //     const invoiceDetail = mInvoiceDetails.find(
      //       (detail) =>
      //         detail.invoice_id === invoice.invoice_id &&
      //         detail.maintenance_id === code
      //     );

      //     if (service && invoiceDetail) {
      //       return {
      //         name: service.name,
      //         cost: service.cost,
      //         quantity: invoiceDetail.quantity,
      //       };
      //     }
      //   });

      //   const aDetailedServices = invoice.accessories.map((code) => {
      //     const service = aServices.find((s) => s.accessory_id === code);
      //     const invoiceDetail = aInvoiceDetails.find(
      //       (detail) =>
      //         detail.invoice_id === invoice.invoice_id &&
      //         detail.accessory_id === code
      //     );

      //     if (service && invoiceDetail) {
      //       return {
      //         name: service.name,
      //         price: service.price,
      //         quantity: invoiceDetail.quantity,
      //       };
      //     }
      //   });

      //   return {
      //     invoice_id: invoice.invoice_id,
      //     fullname: invoice.fullname,
      //     phone: invoice.phone,
      //     email: invoice.email,
      //     carName: invoice.carName,
      //     invoiceDate: formatDate(invoice.create_at),
      //     total: invoice.expense,
      //     note: invoice.note,
      //     maintenanceServices: mDetailedServices,
      //     accessories: aDetailedServices,
      //   };
      // });
      const mInvoicesWithServices = formatMaintenanceInvoiceList(
        mInvoices,
        mServices,
        mInvoiceDetails,
        aServices,
        aInvoiceDetails
      );

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
  createMaintenanceInvoices: async (req: Request, res: Response) => {
    const userId: any = req.headers["userId"] || "";
    const mInvoicesRepository = getRepository(Invoice);
    const {
      licensePlate,
      carName,
      services,
      accessories,
      note,
      fullname,
      email,
      phone,
    } = req.body;
    let salonId = "";
    let expense = 0;

    try {
      let serviceIds = [];
      if (services && services.length !== 0) {
        serviceIds = services.map((service: any) => service.maintenance_id);
      }

      let accessoryIds = [];
      if (accessories && accessories.length !== 0) {
        accessoryIds = accessories.map(
          (accessory: any) => accessory.accessory_id
        );
      }

      const maintenanceServices = serviceIds;
      const mServices = await getRepository(Maintenance).find({
        where: { maintenance_id: In(serviceIds) },
      });

      const accessoryServices = accessoryIds;
      const aServices = await getRepository(Accessory).find({
        where: { accessory_id: In(accessoryIds) },
      });

      if (services && services.length !== 0) {
        for (const service of services) {
          const quantity = service.quantity || 1;
          const dbService = mServices.find(
            (s) => s.maintenance_id === service.maintenance_id
          );
          if (dbService) {
            expense += dbService.cost * quantity;
          }
        }
      }

      if (accessories && accessories.length !== 0) {
        for (const accessory of accessories) {
          const quantity = accessory.quantity || 1;
          const aService = aServices.find(
            (s) => s.accessory_id === accessory.accessory_id
          );
          if (aService) {
            expense += aService.price * quantity;
          }
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
        accessories: accessoryServices,
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

      if (services && services.length !== 0) {
        const mInvoiceDetailRepository = getRepository(MInvoiceDetail);
        for (const service of services) {
          const quantity = service.quantity || 1;
          const mInvoiceDetail = new MInvoiceDetail();

          mInvoiceDetail.invoice_id = savedMaintenanceInvoice.invoice_id;
          mInvoiceDetail.maintenance_id = service.maintenance_id;
          const mService = await getRepository(Maintenance).findOne({
            where: { maintenance_id: service.maintenance_id },
          });
          mInvoiceDetail.quantity = quantity;
          mInvoiceDetail.price = mService?.cost || 1;

          await mInvoiceDetailRepository.save(mInvoiceDetail);
        }
      }

      if (accessories && accessories.length !== 0) {
        const aInvoiceDetailRepository = getRepository(AInvoiceDetail);
        for (const accessory of accessories) {
          const quantity = accessory.quantity || 1;
          const aInvoiceDetail = new AInvoiceDetail();

          aInvoiceDetail.invoice_id = savedMaintenanceInvoice.invoice_id;
          aInvoiceDetail.accessory_id = accessory.accessory_id;
          const aService = await getRepository(Accessory).findOne({
            where: { accessory_id: accessory.accessory_id },
          });
          aInvoiceDetail.quantity = quantity;
          aInvoiceDetail.price = aService?.price || 1;

          await aInvoiceDetailRepository.save(aInvoiceDetail);
        }
      }

      return res.status(201).json({
        status: "success",
        msg: "Create successfully!",
        maintain: savedMaintenanceInvoice,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "failed",
        msg: "Internal server error",
      });
    }
  },
  updateMaintenanceInvoices: async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      licensePlate,
      carName,
      services,
      accessories,
      note,
      fullname,
      email,
      phone,
    } = req.body;
    const InvoicesRepository = getRepository(Invoice);
    const mInvoiceDetailRepository = getRepository(MInvoiceDetail);
    const aInvoiceDetailRepository = getRepository(AInvoiceDetail);

    try {
      let mserviceIds: any = [];
      if (services && services.length !== 0) {
        mserviceIds = services.map((service: any) => service.maintenance_id);
      }

      const maintenanceServices = mserviceIds;

      let aserviceIds: any = [];
      if (accessories && accessories.length !== 0) {
        aserviceIds = accessories.map((service: any) => service.accessory_id);
      }

      const accessoryServices = aserviceIds;

      const Invoice = await InvoicesRepository.findOne({
        where: { invoice_id: id, type: "maintenance" },
      });

      if (!Invoice) {
        return res.status(404).json({
          status: "failed",
          msg: `No maintenance invoice with id: ${id}`,
        });
      }

      Invoice.licensePlate = licensePlate;
      Invoice.carName = carName;
      Invoice.note = note;
      Invoice.fullname = fullname;
      Invoice.email = email;
      Invoice.phone = phone;

      if (maintenanceServices && maintenanceServices.length !== 0) {
        Invoice.maintenanceServices = maintenanceServices;
        await mInvoiceDetailRepository.delete({ invoice_id: id });
      }

      if (accessoryServices && accessoryServices.length !== 0) {
        Invoice.accessories = accessoryServices;
        await aInvoiceDetailRepository.delete({ invoice_id: id });
      }

      let total = 0;

      if (services && services.length !== 0) {
        for (const service of services) {
          const { maintenance_id, quantity } = service;
          const mInvoiceDetail = new MInvoiceDetail();
          mInvoiceDetail.invoice_id = id;
          mInvoiceDetail.maintenance_id = maintenance_id;
          const mService = await getRepository(Maintenance).findOne({
            where: { maintenance_id: service.maintenance_id },
          });
          mInvoiceDetail.quantity = quantity || 1;
          mInvoiceDetail.price = mService?.cost || 1;
          await mInvoiceDetailRepository.save(mInvoiceDetail);

          const dbService = await getRepository(Maintenance).findOne({
            where: { maintenance_id: maintenance_id },
          });
          if (dbService) {
            total += dbService.cost * (quantity || 1);
          }
        }
      }

      if (accessories && accessories.length !== 0) {
        for (const accessory of accessories) {
          const { accessory_id, quantity } = accessory;
          const aInvoiceDetail = new AInvoiceDetail();
          aInvoiceDetail.invoice_id = id;
          aInvoiceDetail.accessory_id = accessory_id;
          const aService = await getRepository(Accessory).findOne({
            where: { accessory_id: accessory.accessory_id },
          });
          aInvoiceDetail.quantity = quantity || 1;
          aInvoiceDetail.price = aService?.price || 1;
          await aInvoiceDetailRepository.save(aInvoiceDetail);

          const dbService = await getRepository(Accessory).findOne({
            where: { accessory_id: accessory_id },
          });
          if (dbService) {
            total += dbService.price * (quantity || 1);
          }
        }
      }

      if (
        (services && services.length !== 0) ||
        (accessories && accessories.length !== 0)
      ) {
        Invoice.expense = total;
        await InvoicesRepository.save(Invoice);
      }

      const result = await InvoicesRepository.findOne({
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
      console.log(error);
      return res
        .status(500)
        .json({ status: "failed", msg: "Internal server error" });
    }
  },
  deleteMaintenanceInvoices: async (req: Request, res: Response) => {
    const { id } = req.params;
    const mInvoicesRepository = getRepository(Invoice);
    const mInvoiceDetailRepository = getRepository(MInvoiceDetail);
    const aInvoiceDetailRepository = getRepository(AInvoiceDetail);
    try {
      //const mInvoice = await mInvoicesRepository.delete(id);
      const mInvoice = await mInvoicesRepository.findOne({
        where: { invoice_id: id, type: "maintenance" },
      });

      if (!mInvoice) {
        return res.status(404).json({
          status: "failed",
          msg: `No maintenance invoices with id: ${id}`,
        });
      }

      await mInvoicesRepository.delete(id);

      if (
        mInvoice.maintenanceServices &&
        mInvoice.maintenanceServices.length !== 0
      )
        await mInvoiceDetailRepository.delete({ invoice_id: id });
      if (mInvoice.accessories && mInvoice.accessories.length !== 0)
        await aInvoiceDetailRepository.delete({ invoice_id: id });

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
