import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveType } from '../../entities/leave-request.entity';

export class CreateLeaveRequestDto {
  @ApiProperty({
    example: '2024-02-01',
    description: 'Leave start date (YYYY-MM-DD)',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2024-02-03',
    description: 'Leave end date (YYYY-MM-DD)',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    example: 'ANNUAL',
    description: 'Type of leave',
    enum: LeaveType,
  })
  @IsEnum(LeaveType)
  leaveType: LeaveType;

  @ApiPropertyOptional({
    example: 'Family vacation',
    description: 'Reason for leave',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    example: 'uuid-of-employee',
    description: 'Employee ID requesting leave',
  })
  @IsUUID()
  employeeId: string;
}
