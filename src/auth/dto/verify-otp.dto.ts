import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'The email of the user to verify the OTP',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The OTP code for verification',
    example: '123456',
  })
  @IsString()
  otp: string;
}
