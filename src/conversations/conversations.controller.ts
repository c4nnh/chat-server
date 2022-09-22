import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '../auth/auth.guard'
import { GetConversationsArgs } from './args/get-conversations.args'
import { ConversationsService } from './conversations.service'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { CreateConversationResponse } from './response/create-conversation.response'
import { GetConversationsResponse } from './response/get-conversations.response'

@Controller('conversations')
@UseGuards(AuthGuard)
@ApiTags('Conversations')
@ApiBearerAuth()
export class ConversationsController {
  constructor(private readonly service: ConversationsService) {}

  @Get()
  getMany(
    @Req() req,
    @Query() query: GetConversationsArgs
  ): Promise<GetConversationsResponse> {
    return this.service.getMany(req.user.userId, query)
  }

  @Post()
  create(
    @Req() req,
    @Body() dto: CreateConversationDto
  ): Promise<CreateConversationResponse> {
    return this.service.createConversation(req.user.userId, dto)
  }
}
