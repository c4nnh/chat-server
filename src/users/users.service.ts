import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../db/prisma.service'
import { UserEntity } from './entities/user.entity'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  me = async (userId: string): Promise<UserEntity> => {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })
    if (!user) {
      throw new NotFoundException(`Your account doesn't exist`)
    }
    return new UserEntity(user)
  }
}
