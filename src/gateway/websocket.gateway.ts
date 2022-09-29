import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { OnEvent } from '@nestjs/event-emitter'
import { AuthenticatedSocket } from './entities/authenticated-socket.entity'
import { GatewaySessionManager } from './gateway.session'
import { Inject } from '@nestjs/common'
import { MessageEntity } from '../messages/entities/message.entity'
import { ConversationEntity } from '../conversations/entities/conversation.entity'

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
  },
})
export class MessagingGateway implements OnGatewayConnection {
  constructor(
    @Inject('GatewaySessionManager')
    private readonly sessions: GatewaySessionManager
  ) {}

  handleConnection(socket: AuthenticatedSocket, ...args: any[]) {
    this.sessions.setSocket(socket.user.id, socket)
  }

  @WebSocketServer()
  server: Server

  @OnEvent('conversation.created')
  handleConversationCreatedEvent(payload: ConversationEntity) {
    this.server.emit('onConversation', payload)
  }

  @OnEvent('message.created')
  handleMessageCreatedEvent(payload: MessageEntity) {
    this.server.emit('onMessage', payload)
  }
}
