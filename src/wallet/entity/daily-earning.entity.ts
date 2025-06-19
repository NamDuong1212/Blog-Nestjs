import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('daily_earnings')
export class DailyEarning {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  creatorId: string;

  @Column()
  date: Date;

  @Column()
  viewsToday: number;

  @Column()
  earningToday: number;

  @Column()
  postId: string;
}
