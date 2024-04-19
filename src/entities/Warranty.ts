import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from "typeorm"
import { Salon } from "./Salon";
import { Car } from "./Car";

@Entity()
export class Warranty {
    @PrimaryGeneratedColumn('uuid')
    warranty_id!: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_at!: Date;

    @Column({})
    name!: string;

    @Column({default: true})
    reuse!: boolean;

    @Column({})
    limit_kilometer!: number;

    @Column({})
    months!: number;

    @Column({})
    policy!: string;

    @Column({nullable: true})
    note!: string;

    @ManyToOne(() => Salon, salon => salon.warranties)
    salon!: Salon;

    @ManyToMany(() => Car, car => car.warranties, { cascade: true })
    @JoinTable()
    car!: Car[];

    init(create_at: Date, name: string, reuse: boolean, limit_kilometer: number, months: number, policy: string, note: string) {
        this.create_at = create_at;
        this.name = name;
        this.reuse = reuse;
        this.limit_kilometer = limit_kilometer;
        this.months = months;
        this.policy = policy;
        this.note = note;
    }
}