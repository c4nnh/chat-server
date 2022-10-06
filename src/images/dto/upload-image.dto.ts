import { IsEnum, IsString } from 'class-validator'

enum ImageFolder {
  AVATAR_FOLDER = 'avatars',
  MESSAGE_FOLDER = 'messages',
  CONVERSATION_FOLDER = 'conversations',
}

export class UploadImageDto {
  @IsString()
  fileName: string

  @IsString()
  fileType: string

  @IsEnum(ImageFolder)
  folder: ImageFolder
}
