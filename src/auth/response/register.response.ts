import { RelationUserEntity } from '../../users/entities/relation-user.entity'
import { Token } from '../entities/token.entity'

export class RegisterResponse {
  user: RelationUserEntity

  token: Token
}
