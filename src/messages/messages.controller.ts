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
import { GetMessageArgs } from './args/get-messages.args'
import { CreateMessageDto } from './dto/create-message.dto'
import { MessagesService } from './messages.service'
import { CreateMessageResponse } from './response/create-message.response'
import { GetMessagesResponse } from './response/get-messages.response'

@Controller('messages')
@UseGuards(AuthGuard)
@ApiTags('Message')
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Get()
  getMany(
    @Req() req,
    @Query() query: GetMessageArgs
  ): Promise<GetMessagesResponse> {
    return this.service.getMany(req.user.userId, query)
  }

  @Post()
  create(
    @Req() req,
    @Body() dto: CreateMessageDto
  ): Promise<CreateMessageResponse> {
    return this.service.create(req.user.userId, dto)
  }
}
