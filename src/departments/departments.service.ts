import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    // Check if department with name already exists
    const existingDepartment = await this.departmentRepository.findOne({
      where: { name: createDepartmentDto.name },
    });

    if (existingDepartment) {
      throw new ConflictException('Department with this name already exists');
    }

    const department = this.departmentRepository.create(createDepartmentDto);
    return await this.departmentRepository.save(department);
  }

  async findAll(): Promise<Department[]> {
    return await this.departmentRepository.find({
      relations: ['employees'],
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id, isActive: true },
      relations: ['employees'],
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    const department = await this.findOne(id);

    // Check name uniqueness if name is being updated
    if (
      updateDepartmentDto.name &&
      updateDepartmentDto.name !== department.name
    ) {
      const existingDepartment = await this.departmentRepository.findOne({
        where: { name: updateDepartmentDto.name },
      });

      if (existingDepartment) {
        throw new ConflictException('Department with this name already exists');
      }
    }

    Object.assign(department, updateDepartmentDto);
    return await this.departmentRepository.save(department);
  }

  async remove(id: string): Promise<void> {
    const department = await this.findOne(id);

    // Check if department has employees
    if (department.employees && department.employees.length > 0) {
      throw new ConflictException(
        'Cannot delete department that has employees. Please reassign employees first.',
      );
    }

    // Soft delete by setting isActive to false
    department.isActive = false;
    await this.departmentRepository.save(department);
  }

  async getDepartmentStats(id: string) {
    const department = await this.findOne(id);

    return {
      department: {
        id: department.id,
        name: department.name,
        description: department.description,
      },
      employeeCount: department.employees?.length || 0,
      employees:
        department.employees?.map((emp) => ({
          id: emp.id,
          fullName: emp.fullName,
          email: emp.email,
          position: emp.position?.title,
        })) || [],
    };
  }
}
