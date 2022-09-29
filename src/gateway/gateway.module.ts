import { Module } from '@nestjs/common'
import { GatewaySessionManager } from './gateway.session'
import { MessagingGateway } from './websocket.gateway'

@Module({
  providers: [
    MessagingGateway,
    {
      provide: 'GatewaySessionManager',
      useClass: GatewaySessionManager,
    },
  ],
})
export class GatewayModule {}
