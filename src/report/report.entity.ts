import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Post } from 'src/post/post.entity';
import User from 'src/user/user.entity';

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  reason: string;

  @ManyToOne(() => Post, (post) => post.reports, { onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => User, (user) => user.reports, { onDelete: 'SET NULL' })
  reportedBy: User;

  @CreateDateColumn()
  reportedAt: Date;
}
