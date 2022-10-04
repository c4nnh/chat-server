import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Prisma } from '@prisma/client'
import { convertToPaginationResponse } from '../common/helpers'
import { PrismaService } from '../db/prisma.service'
import { GetMessageArgs } from './args/get-messages.args'
import { CreateMessageDto } from './dto/create-message.dto'
import { CreateMessageResponse } from './response/create-message.response'
import { GetMessagesResponse } from './response/get-messages.response'

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  private checkConversationExist = async (id: string) => {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
    })
    if (!conversation) {
      throw new NotFoundException('This conversation does not exist')
    }
  }

  private checkUserInConversation = async (
    userId: string,
    conversationId: string
  ) => {
    const checkUserInConversation =
      await this.prisma.userConversation.findFirst({
        where: {
          userId,
          conversationId,
        },
      })

    if (!checkUserInConversation) {
      throw new ForbiddenException('You are not member of this conversation')
    }
  }

  create = async (
    userId: string,
    dto: CreateMessageDto
  ): Promise<CreateMessageResponse> => {
    await this.checkConversationExist(dto.conversationId)
    await this.checkUserInConversation(userId, dto.conversationId)

    const { content, conversationId } = dto

    const message = await this.prisma.message.create({
      data: {
        content,
        conversationId,
        userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        conversation: {
          // select: {
          //   id: true,
          //   name: true,
          //   image: true,
          // },
          include: {
            userConversations: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    })

    this.eventEmitter.emit('message.created', message)

    this.eventEmitter.emit('conversations.update', {
      conversation: {
        ...message.conversation,
        lastMessage: {
          id: message.id,
          content: message.content,
          creator: message.creator,
          createdAt: message.createdAt,
        },
      },
      userIds: message.conversation.userConversations.map(item => item.userId),
    })

    return message
  }

  getMany = async (
    userId: string,
    query: GetMessageArgs
  ): Promise<GetMessagesResponse> => {
    const { offset: skip, limit: take, conversationId } = query

    await this.checkConversationExist(query.conversationId)
    await this.checkUserInConversation(userId, query.conversationId)

    const where: Prisma.MessageWhereInput = {
      conversationId,
    }

    const [total, messages] = await this.prisma.$transaction([
      this.prisma.message.count({
        where,
      }),
      this.prisma.message.findMany({
        skip,
        take,
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ])

    return {
      data: messages.map(item => {
        const { id, content, createdAt, creator } = item
        return {
          id,
          content,
          createdAt,
          creator,
        }
      }),
      pagination: convertToPaginationResponse(total, take),
    }
  }
}
