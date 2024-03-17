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

    @Column()
    date!: Date;

    init(id: string, from: string, to: string, description: string, date: Date) {
        this.id = id;
        this.from = from;
        this.to = to;
        this.description = description;
        this.date = date;
    }
}