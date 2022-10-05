import {
  Body,
  Controller,
  Get,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '../auth/auth.guard'
import { UpdateUserDto } from './dto/update-user.dto'
import { GetContactsResponse } from './responses/get-contacts.response'
import { MeResponse } from './responses/me.response'
import { UsersService } from './users.service'

@Controller()
@UseGuards(AuthGuard)
@ApiTags('User')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('me')
  me(@Req() req): Promise<MeResponse> {
    return this.service.me(req.user.userId)
  }

  @Put('me')
  update(@Req() req, @Body() dto: UpdateUserDto): Promise<MeResponse> {
    return this.service.update(req.user.userId, dto)
  }

  @Get('contacts')
  getContacts(@Req() req, @Query() query): Promise<GetContactsResponse> {
    return this.service.getContacts(req.user.userId, query)
  }
}
