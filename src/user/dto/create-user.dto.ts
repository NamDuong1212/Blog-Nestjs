import {
  ApiProperty,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The username of the user.',
    example: 'username',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: 'The email of the user.',
    example: 'username@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password of the user. Must be at least 6 characters.',
    example: 'password',
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'A short biography of the user.',
    example: 'A passionate developer.',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    description: 'The birthday of the user.',
    example: '2000-01-01',
    required: false,
  })
  @IsOptional()
  @IsDate()
  birthday: Date;

  @ApiProperty({
    description: 'Whether the user is an admin.',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
}
