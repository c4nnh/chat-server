import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class CreateMessageDto {
  @IsNotEmpty()
  @IsUUID('4')
  conversationId: string

  @IsNotEmpty()
  @IsString()
  content: string
}
