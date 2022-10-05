import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { DbModule } from '../db/db.module'
import { AuthModule } from '../auth/auth.module'
import { ThirdPartiesModule } from '../third-parties/third-parties.module'

@Module({
  imports: [DbModule, AuthModule, ThirdPartiesModule],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
