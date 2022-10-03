import { OmitType } from '@nestjs/swagger'
import { RoomDetailEntity } from '../entities/room-detail.entity'

export class GetRoomDetailResponse extends OmitType(RoomDetailEntity, [
  'password',
  'max',
]) {}
