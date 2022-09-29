import { UserEntity } from '../../users/entities/user.entity'
import { Socket } from 'socket.io'

export class AuthenticatedSocket extends Socket {
  user?: UserEntity
}
