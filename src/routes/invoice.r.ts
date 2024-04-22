import { Router } from "express";
import invoiceController from "../controllers/invoice.c";
import mInvoiceController from "../controllers/maintenanceInvoice.c";
import middlewareController from "../middleware/middleware";

const router = Router();

router.get("/", mInvoiceController.getAllMaintenanceInvoices);
router.get("/:id", mInvoiceController.getMaintenanceInvoiceById);
router.get(
  "/by-license/:licensePlate",
  middlewareController.verifyToken,
  mInvoiceController.findMaintenanceInvoicesByLicensePlate
);
router.post(
  "/",
  middlewareController.verifyToken,
  mInvoiceController.createMaintenanceInvoices
);
router.patch("/:id", mInvoiceController.updateMaintenanceInvoices);
router.delete("/:id", mInvoiceController.deleteMaintenanceInvoices);

router.post("/create-invoice", middlewareController.verifyToken, middlewareController.havePermission("C_IV"), invoiceController.printInvoiceBuyCar);
router.post("/lookup", middlewareController.verifyToken, middlewareController.havePermission("R_IV"), invoiceController.lookupInvoiceByInvoiceId);
router.post("/all", middlewareController.verifyToken, middlewareController.havePermission("R_IV"), invoiceController.getAllInvoiceOfSalon);

export default router;
