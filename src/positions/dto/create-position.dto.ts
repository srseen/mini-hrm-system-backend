import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePositionDto {
  @ApiProperty({
    example: 'Software Engineer',
    description: 'Position title',
  })
  @ApiProperty({
    example: 'Software Engineer',
    description: 'Position title',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Develops and maintains software applications',
    description: 'Position description',
  })
  @ApiPropertyOptional({
    example: 'Develops and maintains software applications',
    description: 'Position description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 75000.00,
    description: 'Base salary for this position',
  })
  @ApiPropertyOptional({
    example: 75000.00,
    description: 'Base salary for this position',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  baseSalary?: number;
}