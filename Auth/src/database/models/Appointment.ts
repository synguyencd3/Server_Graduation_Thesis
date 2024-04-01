import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from "typeorm"
import { User } from "./User"
import { Salon } from "./Salon";

@Entity()
export class Appointment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
    
    @Column()
    salon_id!: string;

    @Column()
    date!: Date

    @Column()
    description!: string;

    @Column({default: 0})
    status!: number;

    @Column()
    user_id!: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    create_at!: Date

    @ManyToOne(() => User, user => user.user_id)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => Salon, salon => salon.salon_id)
    @JoinColumn({ name: 'salon_id' })
    salon!: Salon;

    init(salon_id: string, user_id: string, date: Date, description: string, status: number) {
        this.salon_id = salon_id;
        this.user_id = user_id;
        this.date = date;
        this.description = description;
        this.status = status;
    }
}