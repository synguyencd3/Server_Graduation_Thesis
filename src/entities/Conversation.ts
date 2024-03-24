import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Conversation {
    @PrimaryGeneratedColumn("uuid")
    conversation_id!: number;

    @Column("simple-array", { nullable: true })
    participants!: string[];

    @Column("simple-array", { nullable: true })
    messages!: string[];

    @Column({ type: "timestamptz" })
    createdAt!: Date;

    @Column({ type: "timestamptz" })
    updatedAt!: Date;

    init(participants: string[], messages: string[], createdAt: Date, updatedAt: Date) {
        this.participants = participants;
        this.messages = messages;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
