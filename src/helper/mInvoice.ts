import {
  User,
  Invoice,
  Maintenance,
  MInvoiceDetail,
  AInvoiceDetail,
  Accessory,
} from "../entities";
import { getRepository, In } from "typeorm";
import { formatDate } from "../utils";

export const getUserInfo = async (userId: string) => {
  try {
    const user = await getRepository(User).findOne({
      where: { user_id: userId },
      relations: ["salonId"],
    });

    return user;
  } catch (error) {
    throw error;
  }
};

export const getMaintenanceServiceList = async (serviceCodes: string[]) => {
  const maintainRepository = getRepository(Maintenance);
  let services: any = [];
  if (serviceCodes && serviceCodes.length !== 0) {
    services = await maintainRepository.find({
      where: { maintenance_id: In(serviceCodes) },
    });
  }

  return services;
};

export const getAccessoryList = async (accessoryCodes: string[]) => {
  const accessoryRepository = getRepository(Accessory);
  let accessories: any = [];
  if (accessoryCodes && accessoryCodes.length !== 0) {
    accessories = await accessoryRepository.find({
      where: { accessory_id: In(accessoryCodes) },
    });
  }

  return accessories;
};

export const getMaintenanceInvoice = async (invoiceId: string) => {
  try {
    const mInvoicesRepository = getRepository(Invoice);
    const mInvoice = await mInvoicesRepository.findOne({
      where: { invoice_id: invoiceId, type: "maintenance" },
      relations: ["seller"],
    });
    return mInvoice;
  } catch (error) {
    throw error;
  }
};

export const getMaintenanceInvoiceList = async (salonId: string) => {
  try {
    const mInvoicesRepository = getRepository(Invoice);
    const mInvoices = await mInvoicesRepository.find({
      where: { type: "maintenance", seller: { salon_id: salonId } },
      relations: ["seller"],
    });

    return mInvoices;
  } catch (error) {
    throw error;
  }
};

export const getMaintenanceInvoiceDetails = async (invoiceId: string) => {
  const mInvoiceDetailRepository = getRepository(MInvoiceDetail);
  const invoiceDetails = await mInvoiceDetailRepository.find({
    where: { invoice_id: invoiceId },
  });
  return invoiceDetails;
};

export const getAccessoryInvoiceDetails = async (invoiceId: string) => {
  const mInvoiceDetailRepository = getRepository(AInvoiceDetail);
  const invoiceDetails = await mInvoiceDetailRepository.find({
    where: { invoice_id: invoiceId },
  });
  return invoiceDetails;
};

export const getMaintenanceInvoiceDetailsList = async (
  invoiceIds: string[]
) => {
  try {
    const mInvoiceDetailRepository = getRepository(MInvoiceDetail);
    const invoiceDetails = await mInvoiceDetailRepository.find({
      where: { invoice_id: In(invoiceIds) },
    });

    return invoiceDetails;
  } catch (error) {
    throw error;
  }
};

export const getAccessoryInvoiceDetailsList = async (invoiceIds: string[]) => {
  try {
    const aInvoiceDetailRepository = getRepository(AInvoiceDetail);
    const invoiceDetails = await aInvoiceDetailRepository.find({
      where: { invoice_id: In(invoiceIds) },
    });

    return invoiceDetails;
  } catch (error) {
    throw error;
  }
};

export const formatMaintenanceInvoice = (
  mInvoice: Invoice,
  mServices: Maintenance[],
  mInvoiceDetails: MInvoiceDetail[],
  aServices: Accessory[],
  aInvoiceDetails: AInvoiceDetail[]
) => {
  const mDetailedServices = mServices.map((service) => {
    const invoiceDetail = mInvoiceDetails.find(
      (detail) => detail.maintenance_id === service.maintenance_id
    );
    if (invoiceDetail) {
      return {
        name: service.name,
        cost: invoiceDetail.price,
        quantity: invoiceDetail.quantity,
      };
    }
  });

  const aDetailedServices = aServices.map((service) => {
    const invoiceDetail = aInvoiceDetails.find(
      (detail) => detail.accessory_id === service.accessory_id
    );
    if (invoiceDetail) {
      return {
        name: service.name,
        price: invoiceDetail.price,
        quantity: invoiceDetail.quantity,
      };
    }
  });

  const formattedInvoice = {
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
    maintenanceServices: mDetailedServices,
    accessories: aDetailedServices,
  };

  return formattedInvoice;
};

export const formatMaintenanceInvoiceList = (
  mInvoices: Invoice[],
  mServices: Maintenance[],
  mInvoiceDetails: MInvoiceDetail[],
  aServices: Accessory[],
  aInvoiceDetails: AInvoiceDetail[]
) => {
  const formattedInvoices = mInvoices.map((invoice) => {
    let mdetailedServices: any = [];
    if (
      invoice.maintenanceServices &&
      invoice.maintenanceServices.length !== 0
    ) {
      mdetailedServices = invoice.maintenanceServices.map((code) => {
        const service = mServices.find((s) => s.maintenance_id === code);
        const invoiceDetail = mInvoiceDetails.find(
          (detail) =>
            detail.invoice_id === invoice.invoice_id &&
            detail.maintenance_id === code
        );

        if (service && invoiceDetail) {
          return {
            name: service.name,
            cost: invoiceDetail.price,
            quantity: invoiceDetail.quantity,
          };
        }
      });
    }

    let aDetailedServices: any = [];
    if (invoice.accessories && invoice.accessories.length !== 0) {
      aDetailedServices = invoice.accessories.map((code) => {
        const service = aServices.find((s) => s.accessory_id === code);
        const invoiceDetail = aInvoiceDetails.find(
          (detail) =>
            detail.invoice_id === invoice.invoice_id &&
            detail.accessory_id === code
        );

        if (service && invoiceDetail) {
          return {
            name: service.name,
            price: invoiceDetail.price,
            quantity: invoiceDetail.quantity,
          };
        }
      });
    }

    return {
      invoice_id: invoice.invoice_id,
      salon: {
        salon_id: invoice.seller.salon_id,
        salon_name: invoice.seller.name,
      },
      fullname: invoice.fullname,
      email: invoice.email,
      phone: invoice.phone,
      licensePlate: invoice.licensePlate,
      carName: invoice.carName,
      invoiceDate: formatDate(invoice.create_at),
      total: invoice.expense,
      note: invoice.note,
      maintenanceServices: mdetailedServices,
      accessories: aDetailedServices,
    };
  });

  return formattedInvoices;
};
