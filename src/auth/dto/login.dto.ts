import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter correct email' })
  @ApiProperty({
    description: 'The email address of the user.',
    example: 'email@example.com',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @ApiProperty({
    description: 'The password of the user. Must be at least 6 characters long.',
    example: 'password',
  })
  password: string;
}
