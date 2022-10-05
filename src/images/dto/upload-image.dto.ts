import { IsString } from 'class-validator'

export class UploadImageDto {
  @IsString()
  fileName: string

  @IsString()
  fileType: string
}
