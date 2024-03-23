import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm"

@Entity()
export class Appointment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
    
    @Column()
    salon_id!: string;

    @Column()
    user_id!: string;

    @Column()
    date!: Date

    @Column()
    description!: string;

    @Column({default: false})
    accepted!: boolean;

    init(salon_id: string, user_id: string, date: Date, description: string, accepted: boolean) {
        this.salon_id = salon_id;
        this.user_id = user_id;
        this.date = date;
        this.description = description;
        this.accepted = accepted;
    }
}