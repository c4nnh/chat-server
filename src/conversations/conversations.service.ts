import { Injectable } from '@nestjs/common'
import { Conversation, ConversationRole } from '@prisma/client'
import { convertToPaginationResponse } from '../common/helpers'
import { PrismaService } from '../db/prisma.service'
import { GetConversationsArgs } from './args/get-conversations.args'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { CreateConversationResponse } from './response/create-conversation.response'
import { GetConversationsResponse } from './response/get-conversations.response'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  getMany = async (
    userId: string,
    query: GetConversationsArgs
  ): Promise<GetConversationsResponse> => {
    const { offset: skip, limit: take } = query

    const where = {
      userConversations: {
        some: {
          userId,
        },
      },
    }

    const [total, companies] = await this.prisma.$transaction([
      this.prisma.conversation.count({
        where,
      }),
      this.prisma.conversation.findMany({
        skip,
        take,
        where,
        include: {
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              creator: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ])

    return {
      data: companies.map(item => {
        const { id, name, image, messages } = item
        return {
          id,
          name,
          image,
          lastMessage: messages.length ? messages[0] : undefined,
        }
      }),
      pagination: convertToPaginationResponse(total, take),
    }
  }

  createConversation = async (
    userId: string,
    dto: CreateConversationDto
  ): Promise<CreateConversationResponse> => {
    return this.prisma.$transaction(async _prisma => {
      const conversations: Conversation[] = await _prisma.$queryRaw`
        SELECT conversation.* 
        FROM 
        conversation,
          (
            SELECT "conversationId" FROM user_conversation
            GROUP BY "conversationId"
            HAVING ARRAY_AGG("userId" ORDER BY "userId") = ${dto.userIds.sort()}
          ) t2
        WHERE conversation.id = t2."conversationId"
      `
      let conversation = conversations.length ? conversations[0] : undefined
      if (!conversation) {
        conversation = await _prisma.conversation.create({
          data: {},
        })
        await _prisma.userConversation.createMany({
          data: [...dto.userIds, userId].map(uid => ({
            userId: uid,
            conversationId: conversation.id,
            role:
              userId === uid ? ConversationRole.CREATOR : ConversationRole.USER,
          })),
        })
      }
      const message = await _prisma.message.create({
        data: {
          content: dto.content,
          conversationId: conversation.id,
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
        },
      })

      const res = {
        id: conversation.id,
        name: '',
        image: undefined,
        lastMessage: message,
      }

      this.eventEmitter.emit('conversation.created', res)

      return res
    })
  }
}
