import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from "typeorm"
import { Feature } from "./Feature";

@Entity()
export class Permission {
    @PrimaryColumn()
    key!: string;

    @Column({nullable: true})
    name!: string;

    @OneToOne(() => Feature)
    @JoinColumn({ name: 'feature_id' })
    feature_id!: Feature

    init(key: string, name: string) {
        this.key = key;
        this.name = name;
    }
}