import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'apikey',
) {
  constructor(private authService: AuthService) {
    super({ header: 'x-api-key', prefix: '' }, true, async (apiKey, done) => {
      const check = this.authService.validateApiKey(apiKey);
      if (check) {
        done(null, true);
      } else {
        done(new UnauthorizedException(), false);
      }
    });
  }
}
