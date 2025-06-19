import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { Post } from 'src/post/post.entity';
import User from 'src/user/user.entity';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Report, Post, User])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
