import { LessThan, MoreThan, getRepository } from "typeorm";
import { Invoice, Purchase } from '../entities';

const statistics = async ({salonId, type, fromDate}: {salonId: string, type: string, fromDate: Date}) => {

    try {
        let sumExpense = 0;

        if (type!= "package") {
            const invoiceRepository =getRepository(Invoice);
            let invoiceDb: any = await invoiceRepository
            .createQueryBuilder('invoice')
            .innerJoinAndSelect('invoice.seller', 'salon', 'salon.salon_id = :salonId', {salonId })
            .where({type: type, create_at: MoreThan(fromDate)})
            .getMany()
    
            for (let iv of invoiceDb) {
                sumExpense += Number(iv?.expense);
            }
            
            return {invoiceDb, total: sumExpense};
        }

        const purchaseRepository = getRepository(Purchase);
        const purchaseDb: any = await purchaseRepository.find({
            where: {purchaseDate: MoreThan(fromDate)}
        })
        for (let pc of purchaseDb) {
            sumExpense += Number(pc?.total);
        }
        return {purchases: purchaseDb, total: sumExpense};
    } catch (error) {
        return null;
    }
}

export default statistics;