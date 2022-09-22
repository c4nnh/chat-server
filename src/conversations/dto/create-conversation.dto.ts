import { ArrayMinSize, IsNotEmpty, IsString } from 'class-validator'

export class CreateConversationDto {
  @IsNotEmpty()
  @IsString()
  content: string

  @IsNotEmpty({
    each: true,
  })
  @IsString({
    each: true,
  })
  @ArrayMinSize(1)
  userIds: string[]
}
