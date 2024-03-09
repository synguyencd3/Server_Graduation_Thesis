import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Feature } from './Feature';

@Entity()
export class Package {
    @PrimaryGeneratedColumn()
    package_id!: string;

    @Column({nullable: true})
    name!: string;

    @Column({nullable: true})
    description!: string;

    @Column({nullable: true, type: 'float'})
    price!: number;

    @ManyToMany(() => Feature, { cascade: true })
    @JoinTable()
    features!: Feature[];

    init(name: string, description: string, price: number, features: Feature[]) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.features = features;
    }
}