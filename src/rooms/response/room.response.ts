import { OmitType } from '@nestjs/swagger'
import { RoomEntity } from '../entities/room.entity'

export class RoomResponse extends OmitType(RoomEntity, [
  'gameId',
  'password',
]) {}
