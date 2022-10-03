import { Injectable } from '@nestjs/common'
import { AuthenticatedSocket } from './entities/authenticated-socket.entity'

// export interface IGatewaySession {
//   getSocket(id: string)
// }

@Injectable()
export class GatewaySessionManager {
  private readonly sessions: Map<string, AuthenticatedSocket[]> = new Map()

  private getSocketsByUsers(userIds: string[]): AuthenticatedSocket[] {
    return userIds.map(item => this.sessions.get(item)).flat()
  }

  setSocket(userId: string, socket: AuthenticatedSocket) {
    const oldSockets = this.getSocketsByUsers([userId])

    this.sessions.set(userId, [...(oldSockets || []), socket])
  }

  setSockets(userId: string, sockets: AuthenticatedSocket[]) {
    this.sessions.set(userId, sockets)
  }

  deleteSocket(userId: string, socketId: string) {
    const oldSockets = this.getSocketsByUsers([userId])
    this.sessions.set(
      userId,
      (oldSockets || []).filter(item => item?.id !== socketId)
    )
  }

  disconnect(userId: string, socketId: string) {
    const oldSockets = this.getSocketsByUsers([userId])

    this.setSockets(
      userId,
      oldSockets.filter(item => item?.id !== socketId)
    )
  }

  deleteSession(userId: string) {
    this.sessions.delete(userId)
  }

  getAllSockets(): Map<string, AuthenticatedSocket[]> {
    return this.sessions
  }
}
