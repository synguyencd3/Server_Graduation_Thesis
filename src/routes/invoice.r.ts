import { Router } from 'express';
import invoiceController from '../controllers/invoice.c';
import middlewareController from '../middleware/middleware';

const router = Router();

router.post("/create-invoice", invoiceController.printInvoiceBuyCar); 
router.post("/lookup", invoiceController.lookupInvoiceByInvoiceId); 

export default router;