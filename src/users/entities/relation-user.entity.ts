import { PickType } from '@nestjs/swagger'
import { UserEntity } from './user.entity'

export class RelationUser extends PickType(UserEntity, [
  'id',
  'name',
  'image',
]) {}
