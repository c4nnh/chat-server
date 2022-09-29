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
    const { offset, limit } = query

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
      this.prisma.$queryRaw`
        SELECT 
        	c.id, c.image, c.name, 
        	"mId", "mContent", "mCreatedAt",
        	m."uId", "uName", "uImage"
        FROM 
          conversation c,
          user_conversation uc,
          (
            SELECT
              message.id AS "mId",
              message.content AS "mContent",
              message."createdAt" AS "mCreatedAt",
              message."conversationId",
              u.id AS "uId",
              u.name AS "uName",
              u.image AS "uImage"
            FROM 
              message, "user" u,
              (	
                SELECT  
                  "conversationId", MAX(message."createdAt") AS "maxCreatedAt"
                FROM 
                  message
                GROUP BY 
                  "conversationId"
              ) t2
            WHERE
              message."userId" = u.id
              AND message."conversationId" = t2."conversationId"
              AND message."createdAt" = t2."maxCreatedAt"
          ) m
          WHERE
            uc."userId" = ${userId}
            AND uc."conversationId" = c.id
            AND m."conversationId" = c.id
          ORDER BY "mCreatedAt" DESC
          LIMIT ${limit}
          OFFSET ${offset}
      `,
    ])

    return {
      data: (companies as any).map(item => {
        const {
          id,
          name,
          image,
          mId,
          mContent,
          mCreatedAt,
          uId,
          uName,
          uImage,
        } = item
        return {
          id,
          name,
          image,
          lastMessage: {
            id: mId,
            content: mContent,
            createdAt: mCreatedAt,
            creator: {
              id: uId,
              name: uName,
              image: uImage,
            },
          },
        }
      }),
      pagination: convertToPaginationResponse(total, limit),
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
            HAVING ARRAY_AGG("userId" ORDER BY "userId") = ${[
              userId,
              ...dto.userIds,
            ].sort()}
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
          conversation: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      })

      this.eventEmitter.emit('message.created', message)

      const res = {
        id: conversation.id,
        name: conversation.name,
        image: undefined,
        lastMessage: message,
      }

      this.eventEmitter.emit('conversation.created', {
        conversation: res,
        userIds: [...dto.userIds, userId],
      })

      return res
    })
  }
}
