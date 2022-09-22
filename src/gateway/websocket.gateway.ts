import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { OnEvent } from '@nestjs/event-emitter'

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
  },
})
export class MessagingGateway implements OnGatewayConnection {
  handleConnection(client: any, ...args: any[]) {
    console.log(client)
  }

  @WebSocketServer()
  server: Server

  @SubscribeMessage('createMessage')
  handleCreateMessage(@MessageBody() data: any) {
    console.log('Message created')
  }

  @OnEvent('conversation.created')
  handleConversationCreatedEvent(payload: any) {
    console.log(payload)
  }
}
