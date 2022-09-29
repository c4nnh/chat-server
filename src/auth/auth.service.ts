import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { createHash } from 'crypto'
import { PrismaService } from '../db/prisma.service'
import { UserEntity } from '../users/entities/user.entity'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { TokenPayload } from './entities/token-payload.entity'
import { Token } from './entities/token.entity'
import { LoginResponse } from './response/login.response'
import { RegisterResponse } from './response/register.response'

const select = {
  id: true,
  name: true,
  password: true,
  image: true,
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  register = async (dto: RegisterDto): Promise<RegisterResponse> => {
    const checkEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })
    if (checkEmail)
      throw new ConflictException(
        'This email has already been taken',
        'Duplicate email'
      )
    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: this.hashPassword(dto.password),
      },
      select,
    })
    return {
      user: new UserEntity(user),
      token: this.genToken(user),
    }
  }

  login = async (dto: LoginDto): Promise<LoginResponse> => {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
      },
      select,
    })
    if (!user) throw new NotFoundException('Your account does not exist')
    if (user.password !== this.hashPassword(dto.password))
      throw new UnauthorizedException('Your password is incorrect')
    return {
      user: new UserEntity(user),
      token: this.genToken(user),
    }
  }

  refreshToken = async (refreshToken: string): Promise<LoginResponse> => {
    const payload: TokenPayload = this.verifyToken(refreshToken)
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      select,
    })
    return {
      user: new UserEntity(user),
      token: this.genToken(user),
    }
  }

  private genToken = (dto: Pick<UserEntity, 'id'>): Token => {
    const { id: userId } = dto
    return {
      accessToken: this.jwtService.sign({ userId }),
      refreshToken: this.jwtService.sign(
        { userId },
        {
          expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRED'),
        }
      ),
    }
  }

  hashPassword = (password: string): string =>
    createHash('md5').update(password).digest('hex')

  verifyToken = (token: string): TokenPayload => {
    try {
      return this.jwtService.verify(token)
    } catch (e) {
      throw new UnauthorizedException('Token is invalid')
    }
  }
}
