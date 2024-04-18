import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Salon } from "./Salon";
import { User } from "./User";

@Entity()
export class Invoice {
    @PrimaryGeneratedColumn('uuid')
    invoice_id!: string;

    @Column({default: "car"})
    type!: string;

    @Column({})
    expense!: number;

    @Column({})
    description!: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_at!: Date;

    @ManyToOne(() => Salon, salon => salon.invoices)
    seller!: Salon;

    @ManyToOne(() => User, user => user.invoices)
    buyer!: User;

    init(type: string, expense: number, description: string, create_at: Date) {
        this.type = type;
        this.expense = expense;
        this.description = description;
        this.create_at = create_at;
    }
}