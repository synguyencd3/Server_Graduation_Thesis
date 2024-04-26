import { LessThan, MoreThan, getRepository } from "typeorm";
import { Invoice, Maintenance, Purchase } from '../entities';
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
        let purchaseDb: any = await purchaseRepository.find({
            where: { purchaseDate: MoreThan(fromDate) },
            relations: ['user', 'package']
        })
        for (let pc of purchaseDb) {
            sumExpense += Number(pc?.total);
            // DELET infor user
            pc.user = { fullname: pc?.user?.fullname, phone: pc?.user?.phone, email: pc?.user?.email }
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

export const getTopSeller = async ({ salonId, type, fromDate }: { salonId: string, type: string, fromDate: Date }) => {
    let toDate = new Date(new Date(fromDate).getFullYear(), 11, 31);
    const invoiceRepository = getRepository(Invoice);
    let rs: any = new Map<string, number>();
    let rs2: any = [];

    try {


        if (type === "buy car") {
            let invoiceDb: any = await invoiceRepository
                .createQueryBuilder('invoice')
                .innerJoinAndSelect('invoice.seller', 'salon', 'salon.salon_id = :salonId', { salonId })
                .where({ type, create_at: MoreThan(fromDate) && LessThan(toDate) })
                .select('invoice.carName, COUNT(*) AS count')
                .groupBy('invoice.carName')
                .addGroupBy('invoice.invoice_id')
                .addGroupBy('salon.salon_id')
                .getRawMany();

            for (let iv of invoiceDb) {
                rs.set(iv?.carName, rs.has(iv?.carName) ? rs.get(iv?.carName) + Number(iv?.count) : Number(iv?.count));
            }

            for (const [item, count] of rs) {
                const data = { name: item, quantitySold: count };
                rs2.push(data);
            }

        } else if (type === "maintenance") {
            let invoiceDb: any = await invoiceRepository
                .createQueryBuilder('invoice')
                .innerJoinAndSelect('invoice.seller', 'salon', 'salon.salon_id = :salonId', { salonId })
                .where({ type, create_at: MoreThan(fromDate) && LessThan(toDate) })
                .getMany();

            for (let iv of invoiceDb) {
                for (let e of iv?.maintenanceServices) {
                    rs.set(e, rs.has(e) ? rs.get(e) + 1 : 1);
                }
            }

            for (const [item, count] of rs) {
                const inforMTDB = await getInforMaintenance(item);
                const data = { name: inforMTDB, quantitySold: count };
                rs2.push(data);
            }
        }

        return quickSort(rs2);

    } catch (error) {
        console.log(error)
        return null;
    }
}

function quickSort(arr: any): any {
    if (arr.length <= 1) {
        return arr;
    }

    const pivot = arr[Math.floor(arr.length / 2)];
    const equal = [];
    const left = [];
    const right = [];

    for (const num of arr) {
        if (num.quantitySold > pivot.quantitySold) {
            left.push(num);
        } else if (num.quantitySold < pivot.quantitySold) {
            right.push(num);
        } else {
            equal.push(num); // Xử lý các phần tử bằng pivot
        }
    }

    return [...quickSort(left), ...equal, ...quickSort(right)];
}


const getInforMaintenance = async (key: string) => {
    const MTRepository = getRepository(Maintenance);

    try {
        return await MTRepository.findOneOrFail({
            where: { maintenance_id: key }
        })
    } catch (error) {
        return null;
    }
}


export default statistics;
