import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '../auth/auth.guard'
import { FirebaseService } from '../third-parties/firebase.services'
import { UploadImageDto } from './dto/upload-image.dto'
import { CreateSignedUrlResponse } from './response/create-signed-url.response'

@Controller('images')
@UseGuards(AuthGuard)
@ApiTags('Image')
@ApiBearerAuth()
export class ImagesController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post()
  createSignedUrl(
    @Body() dto: UploadImageDto
  ): Promise<CreateSignedUrlResponse> {
    return this.firebaseService.createSignedUrl(dto)
  }
}
