import { Module } from '@nestjs/common'
import { DbModule } from '../db/db.module'
import { GatewaySessionManager } from './gateway.session'
import { MessagingGateway } from './websocket.gateway'

@Module({
  imports: [DbModule],
  providers: [
    MessagingGateway,

    {
      provide: 'GatewaySessionManager',
      useClass: GatewaySessionManager,
    },
  ],
})
export class GatewayModule {}
