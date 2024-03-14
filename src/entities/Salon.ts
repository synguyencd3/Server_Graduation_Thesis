import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Car } from "./Car"; // Import entities Car

@Entity()
export class Salon {
    @PrimaryGeneratedColumn('uuid')
    salon_id!: string;

    @Column({nullable: true})
    name!: string;

    @Column({nullable: true})
    address!: string;

    @Column({nullable: true})
    image!: string;

    @Column({nullable: true})
    email!: string;

    @Column({nullable: true})
    phoneNumber!: string;

    @Column({ type: "text", array: true, nullable: true })
    banner!: string[];

    @Column({nullable: true })
    introductionHtml!: string;

    @Column({nullable: true })
    introductionMarkdown!: string;

    @OneToMany(() => Car, (car) => car.salon)
    cars!: Car[];

    init(name: string, address: string, image: string, email: string, phoneNumber: string,
        banner: string[], introductionHtml: string, introductionMarkdown: string, cars: Car[]) {
        this.name = name;
        this.address = address;
        this.image = image;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.banner = banner;
        this.introductionHtml = introductionHtml;
        this.introductionMarkdown = introductionMarkdown;
        this.cars = cars;
    }
}
