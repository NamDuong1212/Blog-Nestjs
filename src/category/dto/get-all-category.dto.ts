import { ApiProperty } from '@nestjs/swagger';

export class GetAllCategoryDto {
  @ApiProperty({
    description: 'The unique identifier of the category.',
    example: '123',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the category.',
    example: 'Technology',
  })
  name: string;

  @ApiProperty({
    description: 'A brief description of the category.',
    example: 'Category for all tech-related posts.',
  })
  description: string;
}
