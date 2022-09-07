import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, Min } from 'class-validator'

export class PaginationArgs {
  @Min(1)
  @IsOptional()
  @ApiProperty({
    default: 10,
    minimum: 1,
  })
  limit?: number = 10

  @Min(0)
  @IsOptional()
  @ApiProperty({
    default: 0,
    minimum: 0,
  })
  offset?: number = 0
}
