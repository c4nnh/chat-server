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
import { RelationUserEntity } from '../users/entities/relation-user.entity'
import { RoomRole } from '@prisma/client'

@WebSocketGateway()
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject('GatewaySessionManager')
    private readonly sessions: GatewaySessionManager,
    private readonly prisma: PrismaService
  ) {}

  handleDisconnect(socket: AuthenticatedSocket) {
    this.sessions.disconnect(socket.user.userId, socket.id)
  }

  handleConnection(socket: AuthenticatedSocket) {
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
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string }
  ) {
    const { conversationId } = data
    this.server
      .to(`conversation-${conversationId}`)
      .emit('onUserStopTyping', { userId: socket.user.userId })
  }

  @SubscribeMessage('joinWaitingRoom')
  joinWaitingRoom(@ConnectedSocket() socket: AuthenticatedSocket) {
    socket.join('waiting-room')
  }

  @SubscribeMessage('leaveWaitingRoom')
  leaveWaitingRoom(@ConnectedSocket() socket: AuthenticatedSocket) {
    socket.leave('waiting-room')
  }

  @SubscribeMessage('joinRoom')
  joinRoom(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody()
    data: { roomId: string }
  ) {
    socket.join(`room-${data.roomId}`)
  }

  @SubscribeMessage('leaveRoom')
  async leaveRoom(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody()
    payload: { roomId: string }
  ) {
    const { roomId } = payload
    socket.leave(`room-${roomId}`)

    await this.prisma.$transaction(async _prisma => {
      await _prisma.roomMember.deleteMany({
        where: {
          userId: socket.user.userId,
          roomId,
        },
      })
      const joinedRooms = await _prisma.roomMember.findMany({
        where: {
          roomId,
        },
      })
      if (joinedRooms.length) {
        await _prisma.roomMember.update({
          where: {
            id: joinedRooms[0].id,
          },
          data: {
            role: 'CREATOR',
          },
        })
        this.server.to(`room-${roomId}`).emit('onUserLeaveRoom', {
          userId: socket.user.userId,
          newCreatorId: joinedRooms[0].userId,
        })
      } else {
        const room = await this.prisma.room.findUnique({
          where: { id: roomId },
        })
        if (room) {
          await _prisma.room.delete({
            where: {
              id: roomId,
            },
          })
          this.server.to('waiting-room').emit('onDeleteRoom', {
            roomId,
          })
        }
      }
      this.server.to('waiting-room').emit('onUserLeaveRoom', {
        roomId,
      })
    })
  }

  @OnEvent('room.join')
  async handleJoinRoom(payload: {
    roomId: string
    member: RelationUserEntity
  }) {
    const { roomId, member } = payload
    this.server
      .to(`room-${roomId}`)
      .emit('onUserJoinRoom', { ...member, role: RoomRole.MEMBER })

    this.server.to('waiting-room').emit('onUserJoinRoom', {
      roomId,
    })
  }
}
