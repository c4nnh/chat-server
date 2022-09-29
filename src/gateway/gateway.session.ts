import { Injectable } from '@nestjs/common'
import { AuthenticatedSocket } from './entities/authenticated-socket.entity'

// export interface IGatewaySession {
//   getSocket(id: string)
// }

@Injectable()
export class GatewaySessionManager {
  private readonly sessions: Map<string, AuthenticatedSocket> = new Map()

  getSocket(userId: string): AuthenticatedSocket {
    return this.sessions.get(userId)
  }

  setSocket(userId: string, socket: AuthenticatedSocket) {
    this.sessions.set(userId, socket)
  }

  deleteSocket(userId: string) {
    this.sessions.delete(userId)
  }

  getSockets(): Map<string, AuthenticatedSocket> {
    return this.sessions
  }
}
