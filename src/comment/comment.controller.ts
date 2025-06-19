import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Patch,
  Param,
  Delete,
  Get,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiTags('Comment')
  @ApiBearerAuth('token')
  @ApiOperation({
    summary: 'Create a comment',
    description: 'Allows a user to create a comment.',
  })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully.',
    type: CreateCommentDto,
  })
  @UseGuards(JwtAuthGuard)
  @Post('/create')
  async createComment(@Body() createCommentDto: CreateCommentDto, @Req() req) {
    const userId = req.user.id;
    return this.commentService.createComment(createCommentDto, userId);
  }

  @ApiTags('Comment')
  @ApiBearerAuth('token')
  @ApiOperation({
    summary: 'Update a comment',
    description: 'Allows a user to update a comment.',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully.',
    type: UpdateCommentDto,
  })
  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('id') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.commentService.updateComment(
      commentId,
      userId,
      updateCommentDto,
    );
  }

  @ApiTags('Comment')
  @ApiBearerAuth('token')
  @ApiOperation({
    summary: 'Delete a comment',
    description: 'Allows a user to delete a comment.',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment deleted successfully.',
  })
  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  async deleteComment(@Param('id') commentId: string, @Req() req) {
    const userId = req.user.id;
    return this.commentService.deleteComment(commentId, userId);
  }

  @ApiTags('Comment')
  @ApiBearerAuth('token')
  @ApiOperation({
    summary: 'Get comments by postId',
    description: 'Allows a user to get all comments for a specific post.',
  })
  @ApiResponse({
    status: 200,
    description: 'All comments for the specified post',
  })
  @Get('/:postId')
  @UseGuards(JwtAuthGuard)
  async getCommentByPostId(@Param('postId') postId: string) {
    const comments = await this.commentService.getCommentByPostId(postId);
    return { data: comments };
  }

  @ApiTags('Comment')
  @ApiBearerAuth('token')
  @ApiOperation({
    summary: 'Reply to a comment',
    description: 'Allows a user to reply to a comment.',
  })
  @ApiResponse({
    status: 201,
    description: 'Reply created successfully.',
    type: CreateCommentDto,
  })
  @UseGuards(JwtAuthGuard)
  @Post('/reply/:postId/:parentId')
  async replyToComment(
    @Param('postId') postId: string,
    @Param('parentId') parentId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.commentService.replyToComment(createCommentDto, userId, postId, parentId);
  }
}
