import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Conversation, ConversationRole } from '@prisma/client'
import { convertToPaginationResponse } from '../common/helpers'
import { PrismaService } from '../db/prisma.service'
import { GetConversationsArgs } from './args/get-conversations.args'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { CreateConversationResponse } from './response/create-conversation.response'
import { GetConversationsResponse } from './response/get-conversations.response'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { GetConversationDetailResponse } from './response/get-conversation-detail.response'
import { UpdateConversationDto } from './dto/update-conversation.dto'
import { FirebaseService } from '../third-parties/firebase.services'

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly firebaseService: FirebaseService
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

  getOne = async (
    userId: string,
    conversationId: string
  ): Promise<GetConversationDetailResponse> => {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation) {
      throw new NotFoundException(`This conversation doesn't exist`)
    }

    const userConversation = await this.prisma.userConversation.findFirst({
      where: {
        userId,
        conversationId,
      },
    })

    if (!userConversation) {
      throw new ForbiddenException(`You aren't member of this conversation`)
    }

    return conversation
  }

  createConversation = async (
    userId: string,
    dto: CreateConversationDto
  ): Promise<CreateConversationResponse> =>
    this.prisma.$transaction(async _prisma => {
      const userIds = [...dto.userIds, userId]
        .filter(
          (item, index, self) => index === self.findIndex(i => i === item)
        )
        .sort()
      const conversations: Conversation[] = await _prisma.$queryRaw`
        SELECT conversation.* 
        FROM 
        conversation,
          (
            SELECT "conversationId" FROM user_conversation
            GROUP BY "conversationId"
            HAVING ARRAY_AGG("userId" ORDER BY "userId") = ${userIds}
          ) t2
        WHERE conversation.id = t2."conversationId"
        LIMIT 1
      `

      let conversation = conversations.length ? conversations[0] : undefined

      if (!conversation) {
        conversation = await _prisma.conversation.create({
          data: {},
        })
        await _prisma.userConversation.createMany({
          data: userIds.map(uid => ({
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

      const res = {
        id: conversation.id,
        name: conversation.name,
        image: undefined,
        lastMessage: message,
      }

      if (conversations.length) {
        // conversation is existed
        this.eventEmitter.emit('message.created', message)
      }

      this.eventEmitter.emit('conversations.update', {
        conversation: res,
        userIds,
      })

      return res
    })

  update = async (
    userId: string,
    conversationId: string,
    dto: UpdateConversationDto
  ): Promise<Conversation> => {
    const old = await this.getOne(userId, conversationId)

    const conversation = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: dto,
      include: {
        userConversations: {
          select: {
            userId: true,
          },
        },
      },
    })

    this.eventEmitter.emit('conversation.information.update', {
      conversation,
      userIds: conversation.userConversations.map(item => item.userId),
    })

    const { image } = dto

    if (image) {
      await this.firebaseService.deleteImage(old.image)
    }

    return conversation
  }
}
