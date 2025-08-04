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
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Employees')
@ApiBearerAuth()
@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({
    status: 201,
    description: 'Employee has been successfully created.',
  })
  @ApiResponse({ status: 409, description: 'Employee with email already exists.' })
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({
    status: 201,
    description: 'Employee has been successfully created.',
  })
  @ApiResponse({ status: 409, description: 'Employee with email already exists.' })
  create(@Body(ValidationPipe) createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiQuery({
    name: 'department',
    required: false,
    description: 'Filter by department ID',
  })
  @ApiQuery({
    name: 'position',
    required: false,
    description: 'Filter by position ID',
  })
  @ApiResponse({ status: 200, description: 'List of employees.' })
  @ApiOperation({ summary: 'Get all employees' })
  @ApiQuery({
    name: 'department',
    required: false,
    description: 'Filter by department ID',
  })
  @ApiQuery({
    name: 'position',
    required: false,
    description: 'Filter by position ID',
  })
  @ApiResponse({ status: 200, description: 'List of employees.' })
  findAll(
    @Query('department') departmentId?: string,
    @Query('position') positionId?: string,
  ) {
    if (departmentId) {
      return this.employeesService.findByDepartment(departmentId);
    }
    if (positionId) {
      return this.employeesService.findByPosition(positionId);
    }
    return this.employeesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Employee details.' })
  @ApiResponse({ status: 404, description: 'Employee not found.' })
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Employee details.' })
  @ApiResponse({ status: 404, description: 'Employee not found.' })
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update employee' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Employee has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Employee not found.' })
  @ApiOperation({ summary: 'Update employee' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Employee has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Employee not found.' })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete employee (soft delete)' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Employee has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Employee not found.' })
  @ApiOperation({ summary: 'Delete employee (soft delete)' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Employee has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Employee not found.' })
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}