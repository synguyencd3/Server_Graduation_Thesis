import {
    Entity,
    Column,
    Unique,
    PrimaryColumn
} from "typeorm";
import { Length, IsNotEmpty } from "class-validator";

@Entity()
@Unique(["user_id"])
export class User {

    @PrimaryColumn()
    @Length(1, 20)
    user_id!: string;

    @Column({ nullable: true })
    @Length(0, 50)
    fullname!: string;

    @Column({ nullable: true })
    @Length(0, 10)
    gender!: string;

    @Column({ nullable: true })
    @Length(0, 10)
    phone!: string;

    @Column()
    @Length(6, 50)
    email!: string;

    @Column({ nullable: true })
    @Length(0, 200)
    address!: string;

    @Column({ type: 'date' })
    date_of_birth!: Date;

    @Column({ nullable: true })
    @Length(0, 200)
    avatar!: string;

    @Column()
    @IsNotEmpty()
    @Length(0, 10)
    role!: string;

    init(user_id: string, fullname: string, gender: string, phone: string, email: string, address: string, 
        date_of_birth: Date, avatar: string, role: string) {
        this.user_id = user_id;
        this.fullname = fullname;
        this.gender = gender;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.date_of_birth = date_of_birth;
        this.avatar = avatar;
        this.role = role;
    }
}