import { PickType } from '@nestjs/swagger'
import { UserEntity } from '../entities/user.entity'

export class ContactResponse extends PickType(UserEntity, [
  'id',
  'email',
  'name',
  'image',
]) {}
