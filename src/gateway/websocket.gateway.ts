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
    console.log(client.id)
  }

  @WebSocketServer()
  server: Server

  @SubscribeMessage('createMessage')
  handleCreateMessage(@MessageBody() data: any) {
    console.log('Message created')
  }

  @OnEvent('conversation.created')
  handleConversationCreatedEvent(payload: any) {
    this.server.emit('onConversation', payload)
  }

  @OnEvent('message.created')
  handleMessageCreatedEvent(payload: any) {
    this.server.emit('onMessage', payload)
  }
}
