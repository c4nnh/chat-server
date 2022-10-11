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
import { AuthGuard } from '../auth/auth.guard'
import { GetRoomsArgs } from './args/get-rooms.args'
import { CreateRoomDto } from './dto/create-room.dto'
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

  @Post('rooms')
  create(@Req() req, @Body() dto: CreateRoomDto): Promise<string> {
    return this.service.create(req.user.userId, dto)
  }
}
