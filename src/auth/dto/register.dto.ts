import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator'

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  email: string

  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, {
    message:
      'Password must has at least 8 characters and contains digit, lower case and upper case character',
  })
  password: string
}
