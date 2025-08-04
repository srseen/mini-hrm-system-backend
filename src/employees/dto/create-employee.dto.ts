import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({
    example: 'John',
    description: 'Employee first name',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Employee last name',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'john.doe@company.com',
    description: 'Employee email address',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Employee phone number',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Employee hire date (YYYY-MM-DD)',
  })
  @IsDateString()
  hireDate: string;

  @ApiPropertyOptional({
    example: 'uuid-of-department',
    description: 'Department ID',
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({
    example: 'uuid-of-position',
    description: 'Position ID',
  })
  @IsOptional()
  @IsUUID()
  positionId?: string;
}
