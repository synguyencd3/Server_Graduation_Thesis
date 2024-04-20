import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Salon } from "./Salon";

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn("uuid")
  invoice_id!: string;

  @Column({ default: "buy car" })
  type!: string;

  @Column({})
  expense!: number;

  @Column({ nullable: true })
  note!: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  create_at!: Date;

  @ManyToOne(() => Salon, (salon) => salon.invoices)
  seller!: Salon;

  @Column({ nullable: true })
  fullname!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  licensePlate!: string;

  @Column({ nullable: true })
  carName!: string;

  @Column("simple-array", { nullable: true })
  maintenanceServices!: string[];

  init(
    type: string,
    expense: number,
    note: string,
    create_at: Date,
    fullname: string,
    email: string,
    phone: string
  ) {
    this.type = type;
    this.expense = expense;
    this.note = note;
    this.create_at = create_at;
    this.fullname = fullname;
    this.email = email;
    this.phone = phone;
  }
}
