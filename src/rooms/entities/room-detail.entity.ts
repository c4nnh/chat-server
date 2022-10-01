import { Room } from '@prisma/client'
import { Exclude } from 'class-transformer'
import { GameEntity } from '../../games/entities/game.entity'
import { RoomMemberEntity } from './room-member.entity'

export class RoomDetailEntity implements Room {
  constructor(partial: Partial<RoomDetailEntity>) {
    Object.assign(this, partial)
  }

  id: string

  name: string

  @Exclude()
  password: string

  max: number

  createdAt: Date

  updatedAt: Date

  @Exclude()
  gameId: string

  game: GameEntity

  members: RoomMemberEntity[]
}
