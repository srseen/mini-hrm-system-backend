import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard overview statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics.' })
  getDashboard() {
    return this.reportsService.getDashboardStats();
  }

  @Get('employees/summary')
  @ApiOperation({ summary: 'Get employee summary report' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filter by department' })
  @ApiQuery({ name: 'positionId', required: false, description: 'Filter by position' })
  @ApiResponse({ status: 200, description: 'Employee summary report.' })
  getEmployeeSummary(
    @Query('departmentId') departmentId?: string,
    @Query('positionId') positionId?: string,
  ) {
    return this.reportsService.getEmployeeSummary(departmentId, positionId);
  }

  @Get('leave/summary')
  @ApiOperation({ summary: 'Get leave summary report' })
  @ApiQuery({ name: 'year', required: false, description: 'Year (default: current year)' })
  @ApiQuery({ name: 'month', required: false, description: 'Month (1-12)' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filter by department' })
  @ApiResponse({ status: 200, description: 'Leave summary report.' })
  getLeaveSummary(
    @Query('year') year?: number,
    @Query('month') month?: number,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.reportsService.getLeaveSummary(year, month, departmentId);
  }

  @Get('departments/performance')
  @ApiOperation({ summary: 'Get department performance metrics' })
  @ApiResponse({ status: 200, description: 'Department performance metrics.' })
  getDepartmentPerformance() {
    return this.reportsService.getDepartmentPerformance();
  }

  @Get('positions/analysis')
  @ApiOperation({ summary: 'Get position analysis report' })
  @ApiResponse({ status: 200, description: 'Position analysis report.' })
  getPositionAnalysis() {
    return this.reportsService.getPositionAnalysis();
  }
}