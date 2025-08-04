import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { LeaveService } from './leave.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Leave Management')
@ApiBearerAuth()
@ApiTags('Leave Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a leave request' })
  @ApiResponse({
    status: 201,
    description: 'Leave request has been successfully submitted.',
  })
  @ApiResponse({ status: 400, description: 'Invalid request data.' })
  @ApiOperation({ summary: 'Submit a leave request' })
  @ApiResponse({
    status: 201,
    description: 'Leave request has been successfully submitted.',
  })
  @ApiResponse({ status: 400, description: 'Invalid request data.' })
  create(@Body(ValidationPipe) createLeaveRequestDto: CreateLeaveRequestDto) {
    return this.leaveService.create(createLeaveRequestDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get all leave requests (Admin/HR/Manager only)' })
  @ApiResponse({ status: 200, description: 'List of all leave requests.' })
  @ApiOperation({ summary: 'Get all leave requests (Admin/HR/Manager only)' })
  @ApiResponse({ status: 200, description: 'List of all leave requests.' })
  findAll() {
    return this.leaveService.findAll();
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get leave requests for specific employee' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'List of employee leave requests.' })
  @ApiOperation({ summary: 'Get leave requests for specific employee' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'List of employee leave requests.' })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.leaveService.findByEmployee(employeeId);
  }

  @Get('balance/:employeeId')
  @ApiOperation({ summary: 'Get leave balance for employee' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiQuery({ name: 'year', required: false, description: 'Year (default: current year)' })
  @ApiResponse({ status: 200, description: 'Employee leave balance.' })
  @ApiOperation({ summary: 'Get leave balance for employee' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiQuery({ name: 'year', required: false, description: 'Year (default: current year)' })
  @ApiResponse({ status: 200, description: 'Employee leave balance.' })
  getLeaveBalance(
    @Param('employeeId') employeeId: string,
    @Query('year') year?: number,
  ) {
    return this.leaveService.getLeaveBalance(employeeId, year);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get leave request by ID' })
  @ApiParam({ name: 'id', description: 'Leave request ID' })
  @ApiResponse({ status: 200, description: 'Leave request details.' })
  @ApiResponse({ status: 404, description: 'Leave request not found.' })
  @ApiOperation({ summary: 'Get leave request by ID' })
  @ApiParam({ name: 'id', description: 'Leave request ID' })
  @ApiResponse({ status: 200, description: 'Leave request details.' })
  @ApiResponse({ status: 404, description: 'Leave request not found.' })
  findOne(@Param('id') id: string) {
    return this.leaveService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update leave request status (Admin/HR/Manager only)' })
  @ApiParam({ name: 'id', description: 'Leave request ID' })
  @ApiResponse({
    status: 200,
    description: 'Leave request status has been updated.',
  })
  @ApiResponse({ status: 400, description: 'Invalid status update.' })
  @ApiOperation({ summary: 'Update leave request status (Admin/HR/Manager only)' })
  @ApiParam({ name: 'id', description: 'Leave request ID' })
  @ApiResponse({
    status: 200,
    description: 'Leave request status has been updated.',
  })
  @ApiResponse({ status: 400, description: 'Invalid status update.' })
  updateStatus(
    @Param('id') id: string,
    @Body(ValidationPipe) updateLeaveStatusDto: UpdateLeaveStatusDto,
    @Request() req: any,
  ) {
    return this.leaveService.updateStatus(id, updateLeaveStatusDto, req.user.id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel own leave request' })
  @ApiParam({ name: 'id', description: 'Leave request ID' })
  @ApiResponse({
    status: 200,
    description: 'Leave request has been cancelled.',
  })
  @ApiResponse({ status: 403, description: 'Cannot cancel this leave request.' })
  @ApiOperation({ summary: 'Cancel own leave request' })
  @ApiParam({ name: 'id', description: 'Leave request ID' })
  @ApiResponse({
    status: 200,
    description: 'Leave request has been cancelled.',
  })
  @ApiResponse({ status: 403, description: 'Cannot cancel this leave request.' })
  cancel(@Param('id') id: string, @Request() req: any) {
    return this.leaveService.cancel(id, req.user.id);
  }
}