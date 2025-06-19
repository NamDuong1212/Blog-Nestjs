import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post } from '../post/post.entity';
import User from '../user/user.entity';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createComment(
    createCommentDto: CreateCommentDto,
    userId: string,
  ) {
    const { content, postId } = createCommentDto;

    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const comment = this.commentRepository.create({
      content,
      post,
      user: { id: userId } as User,
    });

    const savedComment = await this.commentRepository.save(comment);

    return {
      ...savedComment,
      username: user.username,
      avatar: user.avatar,
    }
  }

  async updateComment(
    commentId: string,
    userId: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user.id !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    comment.content = updateCommentDto.content;
    return this.commentRepository.save(comment);
  }

  async deleteComment(
    commentId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user', 'replies', 'replies.replies'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user.id !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    if (comment.replies && comment.replies.length > 0) {
      await this.deleteReplies(comment.replies);
    }

    await this.commentRepository.remove(comment);

    return { message: 'Comment and replies deleted successfully' };
  }

  private async deleteReplies(replies: Comment[]) {
    for (const reply of replies) {
      if (reply.replies && reply.replies.length > 0) {
        await this.deleteReplies(reply.replies);
      }
      await this.commentRepository.remove(reply);
    }
  }

  async getCommentByPostId(postId: string) {
    const rootComments = await this.commentRepository.find({
      where: { post: { id: postId }, parent: null },
      relations: ['user', 'replies', 'replies.user', 'replies.replies', 'replies.replies.replies'],
    });
  
    const formattedComments = rootComments.map(comment => this.formatComment(comment));
  
    const commentIdsInReplies = new Set(
      formattedComments.flatMap(comment =>
        this.collectReplyIds(comment.replies)
      )
    );
  
    const filteredComments = formattedComments.filter(
      comment => !commentIdsInReplies.has(comment.id)
    );
  
    return { data: filteredComments };
  }

  private formatComment(comment: Comment): any {
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: {
        id: comment.user.id,
        username: comment.user.username,
        email: comment.user.email,
        avatar: comment.user.avatar,
      },
      replies: comment.replies ? comment.replies.map(reply => this.formatComment(reply)) : [],
      post: {
        id: comment.post.id,
        title: comment.post.title,
      },
    };
  }
  private collectReplyIds(replies: any[]): string[] {
    return replies.flatMap(reply => [reply.id, ...this.collectReplyIds(reply.replies)]);
  }
  
  async replyToComment(
    createCommentDto: CreateCommentDto,
    userId: string,
    postId: string,
    parentId: string,
  ) {
    const { content } = createCommentDto;

    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const parentComment = await this.commentRepository.findOne({
      where: { id: parentId, post: { id: postId } },
    });
    if (!parentComment) {
      throw new NotFoundException('Parent comment not found in post.');
    }

    const reply = this.commentRepository.create({
      content,
      post,
      user: { id: userId } as User,
      parent: parentComment,
    });

    const savedReply = await this.commentRepository.save(reply);

    return {
      ...savedReply,
      username: user.username,
      avatar: user.avatar,
    };
  }
}
