import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { Post } from 'src/post/post.entity';
import User from 'src/user/user.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createReport(reason: string, postId: string, userId: string): Promise<Report> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const report = this.reportRepository.create({
      reason,
      post,
      reportedBy: user,
    });
    return this.reportRepository.save(report);
  }
}
