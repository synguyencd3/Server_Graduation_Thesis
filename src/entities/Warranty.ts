import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany } from "typeorm"
import { Salon } from "./Salon";
import { Car } from "./Car";

@Entity()
export class Warranty {
    @PrimaryGeneratedColumn('uuid')
    warranty_id!: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_at!: Date;

    @Column({default: false})
    reuse!: boolean;

    @ManyToOne(() => Salon, salon => salon.warranties)
    salon!: Salon;

    @ManyToMany(() => Car, car => car.warranties)
    car!: Car[];

    init(create_at: Date, reuse: boolean) {
        this.create_at = create_at;
        this.reuse = reuse;
    }
}