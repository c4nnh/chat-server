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
import { Room, RoomRole } from '@prisma/client'
import { UserEntity } from '../users/entities/user.entity'

@WebSocketGateway()
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject('GatewaySessionManager')
    private readonly sessions: GatewaySessionManager,
    private readonly prisma: PrismaService
  ) {}

  async handleDisconnect(socket: AuthenticatedSocket) {
    const userId = socket.user.userId
    this.sessions.disconnect(userId, socket.id)
    const roomMember = await this.prisma.roomMember.findFirst({
      where: {
        userId,
      },
      select: {
        roomId: true,
      },
    })
    const { roomId } = roomMember
    await this.onUserOffline(userId, roomId)
  }

  handleConnection(socket: AuthenticatedSocket) {
    socket.join(socket.user.userId)
    this.sessions.setSocket(socket.user.userId, socket)
  }

  @WebSocketServer()
  server: Server

  @OnEvent('conversations.update')
  handleConversationCreatedEvent(payload: {
    conversation: ConversationEntity
    userIds: string[]
  }) {
    const { conversation, userIds } = payload
    // to update last message in list conversations
    userIds.forEach(item =>
      this.server.to(item).emit('onConversationsUpdate', conversation)
    )
  }

  @OnEvent('conversation.information.update')
  handleConversationInformationUpdatedEvent(payload: {
    conversation: ConversationEntity
    userIds: string[]
  }) {
    const { conversation, userIds } = payload
    // to update last message in list conversations
    userIds.forEach(item =>
      this.server.to(item).emit('onConversationInformationUpdate', conversation)
    )
  }

  @OnEvent('message.created')
  async handleMessageCreatedEvent(message: MessageEntity) {
    // to update list messages
    this.server
      .to(`conversation-${message.conversationId}`)
      .emit('onNewMessage', message)
  }

  @OnEvent('user.update')
  async handleUserUpdate(user: UserEntity) {
    delete user.password

    const conversations = await this.prisma.userConversation.findMany({
      where: {
        userId: user.id,
      },
      select: {
        conversationId: true,
      },
    })

    conversations.forEach(item =>
      this.server
        .to(`conversation-${item.conversationId}`)
        .emit('onUserUpdate', user)
    )
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

  @OnEvent('room.join')
  async handleJoinRoom(payload: {
    roomId: string
    member: RelationUserEntity & { role: RoomRole }
  }) {
    const { roomId, member } = payload
    this.server.to(`room-${roomId}`).emit('onUserJoinRoom', member)
    this.server.to('waiting-room').emit('onUserJoinRoom', roomId)
  }

  @OnEvent('room.create')
  async handleCreateRoom(payload: { room: Room }) {
    const { password, ...rest } = payload.room
    this.server.to('waiting-room').emit('onNewRoom', {
      ...rest,
      hasPassword: !!password,
      numberOfMember: 1,
    })
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

    await this.onUserOffline(socket.user.userId, roomId)
  }

  @OnEvent('user.updateReadyStatus')
  async handleUserUpdateReadyStatus(payload: {
    roomId: string
    userId: string
    isReady: boolean
  }) {
    const { roomId, userId, isReady } = payload

    if (isReady) {
      this.server.to(`room-${roomId}`).emit('onUserReady', { userId })
    } else {
      this.server.to(`room-${roomId}`).emit('onUserUnready', { userId })
    }
  }

  private onUserOffline = async (userId: string, roomId: string) => {
    await this.prisma.$transaction(async _prisma => {
      await _prisma.roomMember.deleteMany({
        where: {
          userId,
          roomId,
        },
      })
      const roomMembers = await _prisma.roomMember.findMany({
        where: {
          roomId,
        },
      })
      if (roomMembers.length) {
        await _prisma.roomMember.update({
          where: {
            id: roomMembers[0].id,
          },
          data: {
            role: 'CREATOR',
            isReady: true,
          },
        })
        this.server.to(`room-${roomId}`).emit('onUserLeaveRoom', {
          userId,
          newCreatorId: roomMembers[0].userId,
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
}
