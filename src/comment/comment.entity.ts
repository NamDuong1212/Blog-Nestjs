import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Post } from '../post/post.entity';
import User from '../user/user.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Post, (post) => post.id, { eager: true })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @ManyToOne(() => Comment, (comment) => comment.replies)
  @JoinColumn({ name: 'parentId' })
  parent: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];

  @CreateDateColumn()
  createdAt: Date;
}
