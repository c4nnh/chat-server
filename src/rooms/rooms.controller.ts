import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '../auth/auth.guard'
import { GetRoomsArgs } from './args/get-rooms.args'
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
}
