import { IsString, IsNotEmpty, IsBoolean, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString() @IsNotEmpty() fullName: string;
  @IsString() @IsNotEmpty() username: string;
  @IsString() @IsNotEmpty() @MinLength(6) password: string;
  @IsString() @IsNotEmpty() position: string;
  @IsString() @IsNotEmpty() office: string;
  @IsBoolean() @IsOptional() isAdmin?: boolean;
  @IsBoolean() @IsOptional() isActive?: boolean;
}