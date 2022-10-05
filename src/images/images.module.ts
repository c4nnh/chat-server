import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { ThirdPartiesModule } from '../third-parties/third-parties.module'
import { ImagesController } from './images.controller'

@Module({
  imports: [ThirdPartiesModule, AuthModule],
  controllers: [ImagesController],
})
export class ImagesModule {}
