import { Body, Controller, HttpCode, Post, Put } from '@nestjs/common'
import { ApiBody, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { RegisterDto } from './dto/register.dto'
import { LoginResponse } from './response/login.response'
import { RegisterResponse } from './response/register.response'

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('register')
  @ApiBody({
    type: RegisterDto,
  })
  register(@Body() dto: RegisterDto): Promise<RegisterResponse> {
    return this.service.register(dto)
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.service.login(dto)
  }

  @Put('refresh-token')
  refreshToken(@Body() dto: RefreshTokenDto): Promise<LoginResponse> {
    return this.service.refreshToken(dto.refreshToken)
  }
}
