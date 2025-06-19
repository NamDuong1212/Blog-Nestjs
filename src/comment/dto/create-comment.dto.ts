import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'The content of the comment.',
    example: 'This is a great post!',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: 'The ID of the post that the comment belongs to.',
    example: '9d2c8d0a-ea53-44f5-b1b2-4120b8462855',
  })
  @IsNotEmpty()
  @IsUUID()
  postId: string;
}
