import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveStatus } from '../../entities/leave-request.entity';

export class UpdateLeaveStatusDto {
  @ApiProperty({
    example: 'APPROVED',
    description: 'New status for the leave request',
    enum: LeaveStatus,
  })
  @ApiProperty({
    example: 'APPROVED',
    description: 'New status for the leave request',
    enum: LeaveStatus,
  })
  @IsEnum(LeaveStatus)
  status: LeaveStatus;

  @ApiPropertyOptional({
    example: 'Approved for family vacation',
    description: 'Comments from approver',
  })
  @ApiPropertyOptional({
    example: 'Approved for family vacation',
    description: 'Comments from approver',
  })
  @IsOptional()
  @IsString()
  approverComments?: string;
}