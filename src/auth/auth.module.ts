import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from 'src/user/user.entity';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { ApiKeyGuard } from './guard/api-key.guard';
import { ApiKeyStrategy } from './strategy/api-key.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: config.get<string | number>('JWT_EXPIRES'),
          },
        };
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    ApiKeyGuard,
    ApiKeyStrategy,
  ],
  exports: [
    JwtStrategy,
    PassportModule,
    JwtAuthGuard,
    ApiKeyGuard,
    ApiKeyStrategy,
  ],
})
export class AuthModule {}
