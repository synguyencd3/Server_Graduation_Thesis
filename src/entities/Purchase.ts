import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn} from 'typeorm';
import { User } from './User';
import { Package } from './Package';

@Entity()
export class Purchase {
  @PrimaryColumn()
  userId!: string;

  @ManyToOne(() => User, user => user.packages)
  @JoinColumn({ name: "userId" })
  user!: User;

  @PrimaryColumn()
  packageId!: string;

  @ManyToOne(() => Package, packagee => packagee.users)
  @JoinColumn({ name: "packageId" })
  package!: Package;

  @Column({ type: 'timestamptz', nullable: true })
  purchaseDate!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expirationDate!: Date;

  @Column({nullable: true, type: 'float'})
  total!: number;

  init(userId: string, packageId: string, purchaseDate: Date, expirationDate: Date, total: number) {
    this.userId = userId;
    this.packageId = packageId;
    this.purchaseDate = purchaseDate;
    this.expirationDate = expirationDate;
    this.total = total;
  }
}