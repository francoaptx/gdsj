import { IsString, IsNotEmpty, IsBoolean, IsOptional, MinLength, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsString() @IsNotEmpty() fullName: string;
  @IsString() @IsNotEmpty() username: string;
  @IsString() @IsNotEmpty() @MinLength(6) password: string;
  @IsString() @IsNotEmpty() instruction: string;
  @IsString() @IsNotEmpty() recipientId: string;
  @IsString() @IsOptional() reference?: string;
  @IsString() @IsOptional() documentId?: string;
  @IsString() @IsNotEmpty() priority: 'normal' | 'urgent';
  @Type(() => Number) @IsNumber() @Min(0) totalPages: number;
  @Type(() => Number) @IsNumber() @Min(0) attachmentsCount: number;
  @IsBoolean() @IsOptional() isAdmin?: boolean;
  @IsBoolean() @IsOptional() isActive?: boolean;
}