import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthService } from './auth.service'
import { TokenPayload } from './entities/token-payload.entity'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const authHeader: string = request.headers.authorization
    if (!authHeader) {
      throw new UnauthorizedException('You are unauthorized')
    }
    const match = authHeader.match(/^Bearer (?<token>.+)$/)
    if (!match || !match.groups.token) return false
    const user: TokenPayload = await this.authService.verifyToken(
      match.groups.token
    )

    if (!user) return false
    request.user = user

    return true
  }
}
