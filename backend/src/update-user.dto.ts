import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString() @IsOptional() fullName?: string;
  @IsString() @IsOptional() username?: string;
  @IsString() @IsOptional() @MinLength(6) password?: string;
  @IsString() @IsOptional() position?: string;
  @IsString() @IsOptional() office?: string;
  @IsBoolean() @IsOptional() isAdmin?: boolean;
  @IsBoolean() @IsOptional() isActive?: boolean;
}