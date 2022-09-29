import { Socket } from 'socket.io'
import { TokenPayload } from '../../auth/entities/token-payload.entity'

export class AuthenticatedSocket extends Socket {
  user?: TokenPayload
}
