import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRouteDto {
  @IsString() @IsNotEmpty() recipientId: string;
  @IsString() @IsNotEmpty() instruction: string;
  @IsString() @IsOptional() reference?: string;
  @IsString() @IsOptional() documentId?: string;
  @Type(() => Number) @IsNumber() @Min(0) totalPages: number;
  @Type(() => Number) @IsNumber() @Min(0) attachmentsCount: number;
  @IsString() @IsNotEmpty() @IsIn(['normal', 'urgent']) priority: 'normal' | 'urgent';
}