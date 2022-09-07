import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt'

@Injectable()
export class JwtConfig implements JwtOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  createJwtOptions(): JwtModuleOptions {
    return {
      secret: this.config.get('JWT_SECRET'),
      signOptions: {
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRED'),
      },
    }
  }
}
