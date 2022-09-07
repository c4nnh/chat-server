import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '../auth/auth.guard'
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
}
