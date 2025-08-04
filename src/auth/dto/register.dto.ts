import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../entities/user.entity';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password (minimum 6 characters)',
    minLength: 6,
  })
  @ApiProperty({
    example: 'password123',
    description: 'User password (minimum 6 characters)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: ['employee'],
    description: 'User roles',
    enum: UserRole,
    isArray: true,
    required: false,
  })
  @ApiProperty({
    example: ['employee'],
    description: 'User roles',
    enum: UserRole,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { each: true })
  roles?: UserRole[];
}
