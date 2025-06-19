import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'The username of the user.',
    example: 'username_updated',
    required: false,
  })
  username?: string;

  @ApiProperty({
    description: 'The email of the user.',
    example: 'email_updated@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'The password of the user. Must be at least 6 characters.',
    example: 'newpassword',
    required: false,
  })
  password?: string;

  @ApiProperty({
    description: 'A short biography of the user.',
    example: 'An updated bio.',
    required: false,
  })
  bio?: string;

  @ApiProperty({
    description: 'The birthday of the user.',
    example: '2000-02-01',
    required: false,
  })
  birthday?: Date;

  @ApiProperty({
    description: 'Whether the user is an admin.',
    example: false,
    required: false,
  })
  isAdmin?: boolean;
}
