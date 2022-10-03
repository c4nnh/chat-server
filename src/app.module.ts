import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DbModule } from './db/db.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { ConversationsModule } from './conversations/conversations.module'
import { GatewayModule } from './gateway/gateway.module'
import { MessagesModule } from './messages/messages.module'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { RoomsModule } from './rooms/rooms.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DbModule,
    UsersModule,
    AuthModule,
    ConversationsModule,
    GatewayModule,
    MessagesModule,
    EventEmitterModule.forRoot(),
    RoomsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
