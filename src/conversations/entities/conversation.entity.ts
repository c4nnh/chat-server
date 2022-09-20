import { Conversation } from '@prisma/client'
import { ConversationMemberEntity } from './conversation-member.entity'

export class ConversationEntity implements Conversation {
  id: string

  name: string | null

  image: string | null

  createdAt: Date

  updatedAt: Date

  members: ConversationMemberEntity[]
}
