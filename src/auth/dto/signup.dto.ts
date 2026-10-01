import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'Username cannot be empty' })
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6, {
    message: 'Password must be at least 6 characters',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}