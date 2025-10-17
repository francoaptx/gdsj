import { IsString, IsNotEmpty, IsOptional, IsNumberString, IsIn } from 'class-validator';

export class CreateRouteDto {
  
  @IsString()
  @IsNotEmpty()
  recipientId: string;

  @IsString()
  @IsNotEmpty()
  instruction: string;

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsNumberString()
  totalPages?: number;

  @IsOptional()
  @IsNumberString()
  attachmentsCount?: number;

  @IsIn(['normal', 'urgent'])
  priority: 'normal' | 'urgent';
}