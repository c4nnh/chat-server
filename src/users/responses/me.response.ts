import { OmitType } from '@nestjs/swagger'
import { UserEntity } from '../entities/user.entity'

export class MeResponse extends OmitType(UserEntity, ['password']) {}
