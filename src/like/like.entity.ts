import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Post } from '../post/post.entity';
import User from '../user/user.entity';

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @ManyToOne(() => User, (user) => user.likes, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
