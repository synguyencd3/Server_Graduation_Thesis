import {
    Entity,
    Column,
    PrimaryColumn
} from "typeorm";
import { Length } from "class-validator";

@Entity()
export class User_Package {

    @PrimaryColumn()
    @Length(1, 20)
    user_id!: string;
    
    @PrimaryColumn()
    @Length(1,20)
    package_id!: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    date_buy!: Date;

    @Column({nullable: true})
    date_expire!: Date;

    init(user_id: string, package_id: string, date_buy: Date, date_expire: Date) {
        this.user_id = user_id;
        this.package_id = package_id;
        this.date_buy = date_buy;
        this.date_expire = date_expire;
    }
}