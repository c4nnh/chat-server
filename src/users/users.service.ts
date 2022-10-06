import { Injectable, NotFoundException } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Prisma } from '@prisma/client'
import { convertToPaginationResponse } from '../common/helpers'
import { PrismaService } from '../db/prisma.service'
import { FirebaseService } from '../third-parties/firebase.services'
import { GetContactsArgs } from './args/get-contact.args'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserEntity } from './entities/user.entity'
import { GetContactsResponse } from './responses/get-contacts.response'

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  me = async (userId: string): Promise<UserEntity> => {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })
    if (!user) {
      throw new NotFoundException(`Your account doesn't exist`)
    }
    return new UserEntity(user)
  }

  update = async (userId: string, dto: UpdateUserDto): Promise<UserEntity> => {
    const user = await this.me(userId)

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: dto,
    })

    const { image } = dto

    if (image) {
      await this.firebaseService.deleteImage(user.image)
    }

    const res = new UserEntity({
      ...user,
      ...dto,
    })
    this.eventEmitter.emit('user.update', res)

    return res
  }

  getContacts = async (
    userId: string,
    query: GetContactsArgs
  ): Promise<GetContactsResponse> => {
    const { offset: skip, limit: take, email } = query

    const where: Prisma.UserWhereInput = {
      email: {
        contains: email,
        mode: 'insensitive',
      },
    }

    const [total, contacts] = await this.prisma.$transaction([
      this.prisma.user.count({
        where,
      }),
      this.prisma.user.findMany({
        skip,
        take,
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      }),
    ])

    return {
      data: contacts.map(item => {
        const { id, name, image, email } = item
        return {
          id,
          name,
          image,
          email,
        }
      }),
      pagination: convertToPaginationResponse(total, take),
    }
  }
}
