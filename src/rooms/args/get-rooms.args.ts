import { GameType } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { PaginationArgs } from '../../common/args/pagination.args'

export class GetRoomsArgs extends PaginationArgs {
  @IsNotEmpty()
  @IsEnum(GameType)
  game: GameType

  @IsString()
  @IsOptional()
  name?: string
}
