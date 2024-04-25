import { LessThan, MoreThan, getRepository } from "typeorm";
import { Invoice, Purchase } from '../entities';
import { isDateInMonth } from "../utils";

const statistics = async ({ salonId, type, fromDate, year }: { salonId: string, type: string, fromDate: Date, year: any }) => {

    try {
        let sumExpense = 0;
        console.log("From date: ", fromDate)
        let toDate = new Date(new Date(fromDate).getFullYear(), 11, 31);

        if (type != "package") {
            const invoiceRepository = getRepository(Invoice);
            let invoiceDb: any = await invoiceRepository
                .createQueryBuilder('invoice')
                .innerJoinAndSelect('invoice.seller', 'salon', 'salon.salon_id = :salonId', { salonId })
                .where({ type: type, create_at: MoreThan(fromDate) && LessThan(toDate) })
                .getMany()

            for (let iv of invoiceDb) {
                sumExpense += Number(iv?.expense);
                // sum to each month
                for (let m in year) {
                    if (isDateInMonth(iv?.create_at, year[m].value)) {
                        year[m].total += iv?.expense;
                    }
                }
            }

            return { invoiceDb, total: sumExpense };
        }

        const purchaseRepository = getRepository(Purchase);
        const purchaseDb: any = await purchaseRepository.find({
            where: { purchaseDate: MoreThan(fromDate) }
        })
        for (let pc of purchaseDb) {
            sumExpense += Number(pc?.total);
            // sum to each month
            for (let m in year) {
                if (isDateInMonth(pc?.purchaseDate, year[m].value)) {
                    year[m].total += pc?.total;
                }
            }
        }

        return { purchases: purchaseDb, total: sumExpense };
    } catch (error) {
        console.log(error)
        return null;
    }
}

export const averageEachMonth = (year: any) => {
    let sum = 0;
    for (let m in year) {
        sum += year[m].total
    }

    return sum / 12;
}

export const getTopSeller = async ({ salonId, type, brand, fromDate }: { salonId: string, type: string, brand: string, fromDate: Date }) => {
    let toDate = new Date(new Date(fromDate).getFullYear(), 11, 31);
    const invoiceRepository = getRepository(Invoice);
    let invoiceDb: any = await invoiceRepository
        .createQueryBuilder('invoice')
        .innerJoinAndSelect('invoice.seller', 'salon', 'salon.salon_id = :salonId', { salonId })
        .where({ type, create_at: MoreThan(fromDate) && LessThan(toDate), brand })
        .getMany()

    

}

export default statistics;
