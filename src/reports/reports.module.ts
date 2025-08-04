import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Employee } from '../entities/employee.entity';
import { Department } from '../entities/department.entity';
import { Position } from '../entities/position.entity';
import { LeaveRequest } from '../entities/leave-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Department, Position, LeaveRequest])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}