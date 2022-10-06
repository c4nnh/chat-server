import { OmitType } from '@nestjs/swagger'
import { ConversationEntity } from '../entities/conversation.entity'

export class GetConversationDetailResponse extends OmitType(
  ConversationEntity,
  ['members']
) {}
