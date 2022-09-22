import { PickType } from '@nestjs/swagger'
import { MessageEntity } from './message.entity'

export class RelationMessageEntity extends PickType(MessageEntity, [
  'id',
  'content',
  'createdAt',
  'creator',
]) {}
