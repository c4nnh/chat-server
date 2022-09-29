import { INestApplicationContext, UnauthorizedException } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { AuthService } from '../auth/auth.service'
import { TokenPayload } from '../auth/entities/token-payload.entity'
import { AuthenticatedSocket } from './entities/authenticated-socket.entity'

export class WebsocketAdapter extends IoAdapter {
  private authService: AuthService

  constructor(private readonly app: INestApplicationContext) {
    super(app)
    app.resolve<AuthService>(AuthService).then(authService => {
      this.authService = authService
    })
  }

  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, options)
    server.use(async (socket: AuthenticatedSocket, next) => {
      const authHeader: string = socket.handshake.headers.authorization

      if (!authHeader) {
        return next(new UnauthorizedException('You are unauthorized'))
      }
      const match = authHeader.match(/^Bearer (?<token>.+)$/)
      if (!match || !match.groups.token)
        return next(new UnauthorizedException('Token is invalid'))

      try {
        const user: TokenPayload = this.authService.verifyToken(
          match.groups.token
        )
        socket.user = user
        next()
      } catch {
        next(new UnauthorizedException('Token is invalid'))
      }
    })
    return server
  }
}
