import { PickType } from '@nestjs/swagger'
import { UserEntity } from './user.entity'

export class RelationUserEntity extends PickType(UserEntity, [
  'id',
  'name',
  'image',
]) {}
