import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './like.entity';
import { Post } from '../post/post.entity';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import User from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Post, User])],
  providers: [LikeService],
  controllers: [LikeController],
})
export class LikeModule {}
