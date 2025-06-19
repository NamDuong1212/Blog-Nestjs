import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import User from 'src/user/user.entity';
import { Post } from 'src/post/post.entity';

@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'int', default: 0 })
  stars: number; 

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Post, (post) => post.id)
  @JoinColumn({ name: 'postId' })
  post: Post;
}
