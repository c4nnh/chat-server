import { INestApplicationContext, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { AuthService } from '../auth/auth.service'
import { TokenPayload } from '../auth/entities/token-payload.entity'
import { AuthenticatedSocket } from './entities/authenticated-socket.entity'

export class WebsocketAdapter extends IoAdapter {
  private authService: AuthService

  constructor(
    private readonly app: INestApplicationContext,
    private readonly configService: ConfigService
  ) {
    super(app)
    app.resolve<AuthService>(AuthService).then(authService => {
      this.authService = authService
    })
  }

  createIOServer(port: number, options?: any) {
    // port = this.configService.get<number>('SOCKET_PORT') || 5001
    const origins = (this.configService.get<string>('CORS_ORIGIN') || '').split(
      ','
    )
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origins,
      },
    })
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
    server.listen(5001)

    return server
  }
}
