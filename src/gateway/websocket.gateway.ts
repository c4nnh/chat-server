import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
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
import { PrismaService } from '../db/prisma.service'

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
  },
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject('GatewaySessionManager')
    private readonly sessions: GatewaySessionManager,
    private readonly prisma: PrismaService
  ) {}

  handleDisconnect(socket: AuthenticatedSocket) {
    console.log('disconnect')

    this.sessions.disconnect(socket.id)
  }

  handleConnection(socket: AuthenticatedSocket) {
    console.log('connect')

    this.sessions.setSocket(socket.user.userId, socket)
  }

  @WebSocketServer()
  server: Server

  @OnEvent('conversation.created')
  handleConversationCreatedEvent(payload: {
    conversation: ConversationEntity
    userIds: string[]
  }) {
    const { conversation, userIds } = payload
    const sockets = this.sessions.getSocketsByUsers(userIds)
    sockets.forEach(item => !!item && item.emit('onConversation', conversation))
  }

  @OnEvent('message.created')
  async handleMessageCreatedEvent(message: MessageEntity) {
    const usersInConversation = await this.prisma.userConversation.findMany({
      where: {
        conversationId: message.conversationId,
      },
      select: {
        userId: true,
      },
    })

    const sockets = this.sessions.getSocketsByUsers(
      usersInConversation.map(item => item.userId)
    )
    sockets.forEach(item => !!item && item.emit('onMessage', message))
    this.server
      .to(`conversation-${message.conversationId}`)
      .emit('onMessage', message)
  }

  @SubscribeMessage('onJoinConversation')
  onJoinConversation(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string }
  ) {
    socket.join(`conversation-${data.conversationId}`)
  }

  @SubscribeMessage('onLeaveConversation')
  onLeaveConversation(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string }
  ) {
    socket.leave(`conversation-${data.conversationId}`)
  }

  @SubscribeMessage('onTypingStart')
  onTypingStart(@MessageBody() data: any) {
    this.server
      .to(`conversation-${data.conversationId}`)
      .emit('onUserTyping', data)
  }

  @SubscribeMessage('onTypingStop')
  onTypingStop(
    @MessageBody() data: { conversationId: string; userId: string }
  ) {
    const { conversationId, userId } = data
    this.server
      .to(`conversation-${conversationId}`)
      .emit('onUserStopTyping', { userId })
  }
}
