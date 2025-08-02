import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRequest, LeaveStatus } from '../entities/leave-request.entity';
import { Employee } from '../entities/employee.entity';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(
    createLeaveRequestDto: CreateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    const { employeeId, startDate, endDate, ...rest } = createLeaveRequestDto;

    // Validate employee exists
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId, isActive: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    if (start < new Date()) {
      throw new BadRequestException('Cannot request leave for past dates');
    }

    // Check for overlapping leave requests
    const overlappingLeave = await this.leaveRequestRepository
      .createQueryBuilder('leave')
      .where('leave.employeeId = :employeeId', { employeeId })
      .andWhere('leave.status IN (:...statuses)', {
        statuses: [LeaveStatus.PENDING, LeaveStatus.APPROVED],
      })
      .andWhere(
        '(leave.startDate <= :endDate AND leave.endDate >= :startDate)',
        { startDate, endDate },
      )
      .getOne();

    if (overlappingLeave) {
      throw new BadRequestException(
        'Leave request overlaps with existing request',
      );
    }

    const leaveRequest = this.leaveRequestRepository.create({
      ...rest,
      startDate: start,
      endDate: end,
      employeeId,
    });

    return await this.leaveRequestRepository.save(leaveRequest);
  }

  async findAll(): Promise<LeaveRequest[]> {
    return await this.leaveRequestRepository.find({
      relations: ['employee', 'employee.department', 'employee.position'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByEmployee(employeeId: string): Promise<LeaveRequest[]> {
    return await this.leaveRequestRepository.find({
      where: { employeeId },
      relations: ['employee'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOne({
      where: { id },
      relations: ['employee', 'employee.department', 'employee.position'],
    });

    if (!leaveRequest) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }

    return leaveRequest;
  }

  async updateStatus(
    id: string,
    updateLeaveStatusDto: UpdateLeaveStatusDto,
    approverId: string,
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(id);

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(
        'Can only update status of pending requests',
      );
    }

    leaveRequest.status = updateLeaveStatusDto.status;
    leaveRequest.approverComments = updateLeaveStatusDto.approverComments || '';
    leaveRequest.approvedBy = approverId;
    leaveRequest.approvedAt = new Date();

    return await this.leaveRequestRepository.save(leaveRequest);
  }

  async cancel(id: string, employeeId: string): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(id);

    if (leaveRequest.employeeId !== employeeId) {
      throw new ForbiddenException(
        'You can only cancel your own leave requests',
      );
    }

    if (leaveRequest.status === LeaveStatus.APPROVED) {
      throw new BadRequestException('Cannot cancel approved leave request');
    }

    leaveRequest.status = LeaveStatus.CANCELLED;
    return await this.leaveRequestRepository.save(leaveRequest);
  }

  async getLeaveBalance(
    employeeId: string,
    year: number = new Date().getFullYear(),
  ) {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId, isActive: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Get approved leave requests for the year
    const approvedLeaves = await this.leaveRequestRepository
      .createQueryBuilder('leave')
      .where('leave.employeeId = :employeeId', { employeeId })
      .andWhere('leave.status = :status', { status: LeaveStatus.APPROVED })
      .andWhere('EXTRACT(YEAR FROM leave.startDate) = :year', { year })
      .getMany();

    // Calculate used days by leave type
    const usedDays = approvedLeaves.reduce(
      (acc, leave) => {
        const days = leave.numberOfDays;
        acc[leave.leaveType] = (acc[leave.leaveType] || 0) + days;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Standard leave entitlements (can be made configurable)
    const entitlements = {
      ANNUAL: 21,
      SICK: 10,
      PERSONAL: 5,
      MATERNITY: 90,
      PATERNITY: 14,
      EMERGENCY: 3,
    };

    const balance = Object.keys(entitlements).reduce(
      (acc, leaveType) => {
        acc[leaveType] = {
          entitled: entitlements[leaveType],
          used: usedDays[leaveType] || 0,
          remaining: entitlements[leaveType] - (usedDays[leaveType] || 0),
        };
        return acc;
      },
      {} as Record<string, any>,
    );

    return {
      employee: {
        id: employee.id,
        fullName: employee.fullName,
        email: employee.email,
      },
      year,
      balance,
    };
  }
}
