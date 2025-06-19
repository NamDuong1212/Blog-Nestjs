import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from './rating.entity';
import { Post } from 'src/post/post.entity';
import User from 'src/user/user.entity';
import { RatingController } from './rating.controller';
import { RatingService } from './rating.service';

@Module({
    imports: [TypeOrmModule.forFeature([Rating, Post, User])],
    controllers: [RatingController],
    providers: [RatingService],
})
export class RatingModule {}
