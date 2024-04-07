import { Entity, Column, PrimaryColumn } from "typeorm"

@Entity()
export class Permission {
    @PrimaryColumn()
    key!: string;

    @Column({nullable: true})
    name!: string;

    init(key: string, name: string) {
        this.key = key;
        this.name = name;
    }
}