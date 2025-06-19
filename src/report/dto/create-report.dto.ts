import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({
    description: 'The reason for reporting the post.',
    example: 'This post contains inappropriate content',
  })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiProperty({
    description: 'The ID of the post being reported.',
    example: '1',
  })
  @IsNotEmpty()
  postId: string;
}
