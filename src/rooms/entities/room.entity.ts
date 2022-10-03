import { GameType, Room } from '@prisma/client'
import { Exclude } from 'class-transformer'

export class RoomEntity implements Room {
  constructor(partial: Partial<RoomEntity>) {
    Object.assign(this, partial)
  }

  id: string

  name: string

  @Exclude()
  password: string

  hasPassword: boolean

  max: number

  createdAt: Date

  updatedAt: Date

  @Exclude()
  gameId: string

  game: GameType

  numberOfMember: number
}
