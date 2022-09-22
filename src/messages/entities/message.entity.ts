import { Message } from '@prisma/client'
import { RelationUserEntity } from '../../users/entities/relation-user.entity'
import { UserEntity } from '../../users/entities/user.entity'

export class MessageEntity implements Message {
  id: string

  content: string

  createdAt: Date

  userId: string

  creator: RelationUserEntity

  conversationId: string
}
