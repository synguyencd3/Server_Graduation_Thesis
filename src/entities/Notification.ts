import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    from!: string;

    @Column()
    to!: string;

    @Column()
    description!: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    date!: Date;

    @Column({nullable: true})
    token!: string;

    init(id: string, from: string, to: string, description: string, date: Date, token: string) {
        this.id = id;
        this.from = from;
        this.to = to;
        this.description = description;
        this.date = date;
        this.token = token;
    }
}