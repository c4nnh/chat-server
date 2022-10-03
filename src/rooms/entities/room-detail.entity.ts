import { GameType, Room } from '@prisma/client'
import { Exclude } from 'class-transformer'
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

  game: GameType

  members: RoomMemberEntity[]
}
