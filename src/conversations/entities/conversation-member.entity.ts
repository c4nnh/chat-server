import { PickType } from '@nestjs/swagger'
import { ConversationRole } from '@prisma/client'
import { UserEntity } from '../../users/entities/user.entity'

export class ConversationMemberEntity extends PickType(UserEntity, [
  'id',
  'name',
  'image',
]) {
  role: ConversationRole

  joinedAt: Date
}
