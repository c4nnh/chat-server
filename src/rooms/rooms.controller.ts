import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '../auth/auth.guard'
import { GetRoomsArgs } from './args/get-rooms.args'
import { JoinRoomDto } from './dto/join-room.dto'
import { GetRoomDetailResponse } from './response/get-room-detail.response'
import { GetRoomsResponse } from './response/get-rooms.response'
import { RoomsService } from './rooms.service'

@UseGuards(AuthGuard)
@ApiTags('Room')
@ApiBearerAuth()
@Controller()
export class RoomsController {
  constructor(private readonly service: RoomsService) {}

  @Get('rooms')
  getMany(@Query() query: GetRoomsArgs): Promise<GetRoomsResponse> {
    return this.service.getMany(query)
  }

  @Get('rooms/:id')
  getOne(
    @Req() req,
    @Param('id') roomId: string
  ): Promise<GetRoomDetailResponse> {
    return this.service.getOne(req.user.userId, roomId)
  }

  @Put('join-room/:id')
  joinRoom(
    @Req() req,
    @Param('id') roomId: string,
    @Body() dto: JoinRoomDto
  ): Promise<boolean> {
    return this.service.joinRoom(req.user.userId, roomId, dto)
  }
}
