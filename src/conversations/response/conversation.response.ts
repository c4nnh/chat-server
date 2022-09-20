import { PickType } from '@nestjs/swagger'
import { ConversationEntity } from '../entities/conversation.entity'

export class ConversationResponse extends PickType(ConversationEntity, [
  'id',
  'image',
  'name',
]) {}
