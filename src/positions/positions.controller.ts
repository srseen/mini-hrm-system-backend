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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Positions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: 'Create a new position' })
  @ApiResponse({
    status: 201,
    description: 'Position has been successfully created.',
  })
  @ApiResponse({
    status: 409,
    description: 'Position with title already exists.',
  })
  create(@Body(ValidationPipe) createPositionDto: CreatePositionDto) {
    return this.positionsService.create(createPositionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all positions' })
  @ApiResponse({ status: 200, description: 'List of positions.' })
  findAll() {
    return this.positionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get position by ID' })
  @ApiParam({ name: 'id', description: 'Position ID' })
  @ApiResponse({ status: 200, description: 'Position details.' })
  @ApiResponse({ status: 404, description: 'Position not found.' })
  findOne(@Param('id') id: string) {
    return this.positionsService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get position statistics' })
  @ApiParam({ name: 'id', description: 'Position ID' })
  @ApiResponse({ status: 200, description: 'Position statistics.' })
  @ApiResponse({ status: 404, description: 'Position not found.' })
  getStats(@Param('id') id: string) {
    return this.positionsService.getPositionStats(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: 'Update position' })
  @ApiParam({ name: 'id', description: 'Position ID' })
  @ApiResponse({
    status: 200,
    description: 'Position has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Position not found.' })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updatePositionDto: UpdatePositionDto,
  ) {
    return this.positionsService.update(id, updatePositionDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete position (soft delete)' })
  @ApiParam({ name: 'id', description: 'Position ID' })
  @ApiResponse({
    status: 200,
    description: 'Position has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Position not found.' })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete position with employees.',
  })
  remove(@Param('id') id: string) {
    return this.positionsService.remove(id);
  }
}
