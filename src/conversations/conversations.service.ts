import { Injectable } from '@nestjs/common'
import { convertToPaginationResponse } from '../common/helpers'
import { PrismaService } from '../db/prisma.service'
import { GetConversationsArgs } from './args/get-conversations.args'
import { GetConversationsResponse } from './response/get-conversations.response'

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

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
        select: {
          id: true,
          name: true,
          image: true,
        },
      }),
    ])

    return {
      data: companies,
      pagination: convertToPaginationResponse(total, take),
    }
  }
}