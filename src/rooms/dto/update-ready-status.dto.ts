import { IsBoolean } from 'class-validator'

export class UpdateReadyStatusDto {
  @IsBoolean()
  isReady: boolean
}
