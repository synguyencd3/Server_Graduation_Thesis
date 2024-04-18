import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Salon } from "./Salon";

@Entity()
export class Invoice {
    @PrimaryGeneratedColumn('uuid')
    invoice_id!: string;

    @Column({default: "buy car"})
    type!: string;

    @Column({})
    expense!: number;

    @Column({})
    description!: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_at!: Date;

    @ManyToOne(() => Salon, salon => salon.invoices)
    seller!: Salon;

    @Column({nullable: true})
    fullname!: string;

    @Column({nullable: true})
    email!: string;
    
    @Column({nullable: true})
    phone!: string;

    init(type: string, expense: number, description: string, create_at: Date, fullname: string, email: string, phone: string) {
        this.type = type;
        this.expense = expense;
        this.description = description;
        this.create_at = create_at;
        this.fullname = fullname;
        this.email = email;
        this.phone = phone;
    }
}