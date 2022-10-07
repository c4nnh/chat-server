import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Conversation } from '@prisma/client'
import { AuthGuard } from '../auth/auth.guard'
import { GetConversationsArgs } from './args/get-conversations.args'
import { ConversationsService } from './conversations.service'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { UpdateConversationDto } from './dto/update-conversation.dto'
import { CreateConversationResponse } from './response/create-conversation.response'
import { GetConversationDetailResponse } from './response/get-conversation-detail.response'
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

  @Get(':id')
  getOne(
    @Req() req,
    @Param('id') conversationId: string
  ): Promise<GetConversationDetailResponse> {
    return this.service.getOne(req.user.userId, conversationId)
  }

  @Post()
  create(
    @Req() req,
    @Body() dto: CreateConversationDto
  ): Promise<CreateConversationResponse> {
    return this.service.createConversation(req.user.userId, dto)
  }

  @Put(':id')
  update(
    @Req() req,
    @Param('id') conversationId: string,
    @Body() dto: UpdateConversationDto
  ): Promise<Conversation> {
    return this.service.update(req.user.userId, conversationId, dto)
  }
}
