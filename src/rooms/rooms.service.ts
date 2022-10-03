import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Prisma } from '@prisma/client'
import { convertToPaginationResponse } from '../common/helpers'
import { PrismaService } from '../db/prisma.service'
import { GetRoomsArgs } from './args/get-rooms.args'
import { JoinRoomDto } from './dto/join-room.dto'
import { GetRoomDetailResponse } from './response/get-room-detail.response'
import { GetRoomsResponse } from './response/get-rooms.response'

@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  getMany = async (query: GetRoomsArgs): Promise<GetRoomsResponse> => {
    const { offset: skip, limit: take, gameType, name } = query

    const where: Prisma.RoomWhereInput = {
      game: gameType,
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
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ])

    return {
      data: raw.map(item => {
        const { _count, password, ...rest } = item
        return {
          ...rest,
          numberOfMember: _count.roomMembers,
          hasPassword: !!password,
        }
      }),
      pagination: convertToPaginationResponse(total, take),
    }
  }

  getOne = async (
    userId: string,
    roomId: string
  ): Promise<GetRoomDetailResponse> => {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        roomMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    })

    if (!room) {
      throw new NotFoundException('This room does not exist')
    }
    const { id, name, game, roomMembers, createdAt, updatedAt } = room

    const joinedRooms = await this.prisma.roomMember.findMany({
      where: {
        userId: userId,
      },
    })

    if (joinedRooms.filter(item => item.roomId !== roomId).length) {
      throw new BadRequestException('You are in another room.')
    }

    return {
      id,
      name,
      game,
      createdAt,
      updatedAt,
      members: roomMembers.map(item => {
        const { user, role, isReady, joinAt } = item
        return {
          ...user,
          joinAt,
          role,
          isReady,
        }
      }),
    }
  }

  joinRoom = async (
    userId: string,
    roomId: string,
    dto?: JoinRoomDto
  ): Promise<boolean> => {
    const { password } = dto
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        _count: true,
      },
    })

    if (!room) {
      throw new NotFoundException('This room does not exist')
    }

    if (room._count.roomMembers === room.max) {
      throw new BadRequestException(
        'This room is full. Please choose another room'
      )
    }

    if (room.password && room.password !== password) {
      throw new BadRequestException('Password is incorrect')
    }

    const joinedRooms = await this.prisma.roomMember.findMany({
      where: {
        userId,
      },
    })

    if (joinedRooms.length) {
      throw new BadRequestException('You are in another room.')
    }

    const roomMembers = await this.prisma.roomMember.findMany({
      where: {
        roomId,
      },
    })

    const roomMember = await this.prisma.roomMember.create({
      data: {
        roomId: roomId,
        userId: userId,
        role: roomMembers.length ? 'MEMBER' : 'CREATOR',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })
    this.eventEmitter.emit('room.join', {
      roomId,
      member: {
        ...roomMember.user,
        role: roomMember.role,
      },
    })

    return true
  }
}
