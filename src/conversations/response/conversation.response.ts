import { PickType } from '@nestjs/swagger'
import { ConversationEntity } from '../entities/conversation.entity'
import { RelationMessageEntity } from '../../messages/entities/relation-message.entity'

export class ConversationResponse extends PickType(ConversationEntity, [
  'id',
  'image',
  'name',
]) {
  lastMessage: RelationMessageEntity
}
