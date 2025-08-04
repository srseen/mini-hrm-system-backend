import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({
    example: 'Human Resources',
    description: 'Department name',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Manages employee relations and company policies',
    description: 'Department description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
