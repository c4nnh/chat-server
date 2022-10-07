import { IsOptional, IsString } from 'class-validator'

export class UpdateConversationDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  image?: string
}
