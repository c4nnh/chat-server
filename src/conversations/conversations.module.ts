import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { DbModule } from '../db/db.module'
import { ConversationsController } from './conversations.controller'
import { ConversationsService } from './conversations.service'

@Module({
  imports: [DbModule, AuthModule],
  providers: [ConversationsService],
  controllers: [ConversationsController],
})
export class ConversationsModule {}
