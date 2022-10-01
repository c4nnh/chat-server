import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { convertToPaginationResponse } from '../common/helpers'
import { PrismaService } from '../db/prisma.service'
import { GetRoomsArgs } from './args/get-rooms.args'
import { GetRoomsResponse } from './response/get-rooms.response'

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  getMany = async (query: GetRoomsArgs): Promise<GetRoomsResponse> => {
    const { offset: skip, limit: take, gameType, name } = query

    const where: Prisma.RoomWhereInput = {
      game: {
        type: gameType,
      },
      name,
    }

    const [total, raw] = await this.prisma.$transaction([
      this.prisma.room.count({
        where,
      }),
      this.prisma.room.findMany({
        skip,
        take,
        where,
        include: {
          _count: true,
          game: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ])

    return {
      data: raw.map(item => {
        const { _count, password, gameId, game, ...rest } = item
        return {
          ...rest,
          game: {
            ...game,
            id: gameId,
          },
          numberOfMember: _count.roomMembers,
          hasPassword: !!password,
        }
      }),
      pagination: convertToPaginationResponse(total, take),
    }
  }
}
