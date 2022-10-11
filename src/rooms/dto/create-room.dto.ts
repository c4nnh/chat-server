import { GameType } from '@prisma/client'
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'

export class CreateRoomDto {
  @IsEnum(GameType)
  game: GameType

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  password?: string

  @IsOptional()
  @IsNumber()
  @Max(4)
  @Min(2)
  max?: number
}
