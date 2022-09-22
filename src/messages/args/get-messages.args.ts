import { IsNotEmpty, IsString, IsUUID } from 'class-validator'
import { PaginationArgs } from '../../common/args/pagination.args'

export class GetMessageArgs extends PaginationArgs {
  @IsNotEmpty()
  @IsUUID('4')
  conversationId: string
}
