import {
    Entity,
    Column,
    PrimaryColumn
} from "typeorm";
import { Length } from "class-validator";

@Entity()
export class Account {

    @PrimaryColumn()
    @Length(1,20)
    username!: string;

    @Column()
    @Length(1, 100)
    password!: string;

    @Column()
    @Length(1, 20)
    user_id!: string;

    init(username: string, password: string, user_id: string) {
        this.username = username;
        this.password = password;
        this.user_id = user_id;
    }
}