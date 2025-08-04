import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@ApiTags('Application')
@ApiTags('Application')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get welcome message' })
  @ApiOperation({ summary: 'Get welcome message' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('protected')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Protected route example' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Protected route example' })
  getProtected(): string {
    return 'This is a protected route! You are authenticated.';
  }
}
