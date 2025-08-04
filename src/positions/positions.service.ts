import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position } from '../entities/position.entity';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
  ) {}

  async create(createPositionDto: CreatePositionDto): Promise<Position> {
    // Check if position with title already exists
    const existingPosition = await this.positionRepository.findOne({
      where: { title: createPositionDto.title },
    });

    if (existingPosition) {
      throw new ConflictException('Position with this title already exists');
    }

    const position = this.positionRepository.create(createPositionDto);
    return await this.positionRepository.save(position);
  }

  async findAll(): Promise<Position[]> {
    return await this.positionRepository.find({
      relations: ['employees'],
      where: { isActive: true },
      order: { title: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Position> {
    const position = await this.positionRepository.findOne({
      where: { id, isActive: true },
      relations: ['employees'],
    });

    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    return position;
  }

  async update(
    id: string,
    updatePositionDto: UpdatePositionDto,
  ): Promise<Position> {
    const position = await this.findOne(id);

    // Check title uniqueness if title is being updated
    if (updatePositionDto.title && updatePositionDto.title !== position.title) {
      const existingPosition = await this.positionRepository.findOne({
        where: { title: updatePositionDto.title },
      });

      if (existingPosition) {
        throw new ConflictException('Position with this title already exists');
      }
    }

    Object.assign(position, updatePositionDto);
    return await this.positionRepository.save(position);
  }

  async remove(id: string): Promise<void> {
    const position = await this.findOne(id);

    // Check if position has employees
    if (position.employees && position.employees.length > 0) {
      throw new ConflictException(
        'Cannot delete position that has employees. Please reassign employees first.',
      );
    }

    // Soft delete by setting isActive to false
    position.isActive = false;
    await this.positionRepository.save(position);
  }

  async getPositionStats(id: string) {
    const position = await this.findOne(id);

    return {
      position: {
        id: position.id,
        title: position.title,
        description: position.description,
        baseSalary: position.baseSalary,
      },
      employeeCount: position.employees?.length || 0,
      employees:
        position.employees?.map((emp) => ({
          id: emp.id,
          fullName: emp.fullName,
          email: emp.email,
          department: emp.department?.name,
        })) || [],
    };
  }
}
