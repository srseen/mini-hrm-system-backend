import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity';
import { Department } from '../entities/department.entity';
import { Position } from '../entities/position.entity';
import { LeaveRequest, LeaveStatus } from '../entities/leave-request.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
  ) {}

  async getDashboardStats() {
    const [
      totalEmployees,
      totalDepartments,
      totalPositions,
      pendingLeaves,
      approvedLeavesToday,
    ] = await Promise.all([
      this.employeeRepository.count({ where: { isActive: true } }),
      this.departmentRepository.count({ where: { isActive: true } }),
      this.positionRepository.count({ where: { isActive: true } }),
      this.leaveRequestRepository.count({
        where: { status: LeaveStatus.PENDING },
      }),
      this.leaveRequestRepository.count({
        where: {
          status: LeaveStatus.APPROVED,
          startDate: new Date(),
        },
      }),
    ]);

    return {
      overview: {
        totalEmployees,
        totalDepartments,
        totalPositions,
        pendingLeaves,
        approvedLeavesToday,
      },
      timestamp: new Date(),
    };
  }

  async getEmployeeSummary(departmentId?: string, positionId?: string) {
    const queryBuilder = this.employeeRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.department', 'department')
      .leftJoinAndSelect('employee.position', 'position')
      .where('employee.isActive = :isActive', { isActive: true });

    if (departmentId) {
      queryBuilder.andWhere('employee.departmentId = :departmentId', {
        departmentId,
      });
    }

    if (positionId) {
      queryBuilder.andWhere('employee.positionId = :positionId', {
        positionId,
      });
    }

    const employees = await queryBuilder.getMany();

    const summary = {
      totalEmployees: employees.length,
      byDepartment: {},
      byPosition: {},
      recentHires: employees
        .filter(emp => {
          const hireDate = new Date(emp.hireDate);
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          return hireDate >= threeMonthsAgo;
        })
        .length,
    };

    // Group by department
    employees.forEach(emp => {
      const deptName = emp.department?.name || 'Unassigned';
      summary.byDepartment[deptName] = (summary.byDepartment[deptName] || 0) + 1;
    });

    // Group by position
    employees.forEach(emp => {
      const posName = emp.position?.title || 'Unassigned';
      summary.byPosition[posName] = (summary.byPosition[posName] || 0) + 1;
    });

    return {
      summary,
      employees: employees.map(emp => ({
        id: emp.id,
        fullName: emp.fullName,
        email: emp.email,
        department: emp.department?.name,
        position: emp.position?.title,
        hireDate: emp.hireDate,
      })),
    };
  }

  async getLeaveSummary(year?: number, month?: number, departmentId?: string) {
    const currentYear = year || new Date().getFullYear();
    
    const queryBuilder = this.leaveRequestRepository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.employee', 'employee')
      .leftJoinAndSelect('employee.department', 'department')
      .where('EXTRACT(YEAR FROM leave.startDate) = :year', { year: currentYear });

    if (month) {
      queryBuilder.andWhere('EXTRACT(MONTH FROM leave.startDate) = :month', { month });
    }

    if (departmentId) {
      queryBuilder.andWhere('employee.departmentId = :departmentId', { departmentId });
    }

    const leaves = await queryBuilder.getMany();

    const summary = {
      totalRequests: leaves.length,
      byStatus: {
        pending: leaves.filter(l => l.status === LeaveStatus.PENDING).length,
        approved: leaves.filter(l => l.status === LeaveStatus.APPROVED).length,
        rejected: leaves.filter(l => l.status === LeaveStatus.REJECTED).length,
        cancelled: leaves.filter(l => l.status === LeaveStatus.CANCELLED).length,
      },
      byType: {},
      byDepartment: {},
      totalDays: leaves
        .filter(l => l.status === LeaveStatus.APPROVED)
        .reduce((sum, leave) => sum + leave.numberOfDays, 0),
    };

    // Group by leave type
    leaves.forEach(leave => {
      summary.byType[leave.leaveType] = (summary.byType[leave.leaveType] || 0) + 1;
    });

    // Group by department
    leaves.forEach(leave => {
      const deptName = leave.employee.department?.name || 'Unassigned';
      summary.byDepartment[deptName] = (summary.byDepartment[deptName] || 0) + 1;
    });

    return {
      period: { year: currentYear, month },
      summary,
      recentRequests: leaves
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10)
        .map(leave => ({
          id: leave.id,
          employee: leave.employee.fullName,
          department: leave.employee.department?.name,
          leaveType: leave.leaveType,
          startDate: leave.startDate,
          endDate: leave.endDate,
          numberOfDays: leave.numberOfDays,
          status: leave.status,
        })),
    };
  }

  async getDepartmentPerformance() {
    const departments = await this.departmentRepository.find({
      relations: ['employees'],
      where: { isActive: true },
    });

    const performance = await Promise.all(
      departments.map(async dept => {
        const employeeIds = dept.employees.map(emp => emp.id);
        
        const [totalLeaves, approvedLeaves] = await Promise.all([
          this.leaveRequestRepository.count({
            where: { employeeId: { $in: employeeIds } as any },
          }),
          this.leaveRequestRepository.count({
            where: {
              employeeId: { $in: employeeIds } as any,
              status: LeaveStatus.APPROVED,
            },
          }),
        ]);

        return {
          department: {
            id: dept.id,
            name: dept.name,
            description: dept.description,
          },
          metrics: {
            totalEmployees: dept.employees.length,
            totalLeaveRequests: totalLeaves,
            approvedLeaves,
            leaveApprovalRate: totalLeaves > 0 ? (approvedLeaves / totalLeaves) * 100 : 0,
            avgEmployeesPerDept: dept.employees.length,
          },
        };
      }),
    );

    return {
      departments: performance,
      summary: {
        totalDepartments: departments.length,
        avgEmployeesPerDept: Math.round(
          departments.reduce((sum, dept) => sum + dept.employees.length, 0) / departments.length,
        ),
      },
    };
  }

  async getPositionAnalysis() {
    const positions = await this.positionRepository.find({
      relations: ['employees'],
      where: { isActive: true },
    });

    const analysis = positions.map(position => {
      const salaries = position.employees
        .map(emp => position.baseSalary)
        .filter(salary => salary !== null && salary !== undefined);

      return {
        position: {
          id: position.id,
          title: position.title,
          description: position.description,
          baseSalary: position.baseSalary,
        },
        metrics: {
          totalEmployees: position.employees.length,
          avgSalary: salaries.length > 0 
            ? salaries.reduce((sum, salary) => sum + salary, 0) / salaries.length 
            : 0,
          minSalary: salaries.length > 0 ? Math.min(...salaries) : 0,
          maxSalary: salaries.length > 0 ? Math.max(...salaries) : 0,
        },
        employees: position.employees.map(emp => ({
          id: emp.id,
          fullName: emp.fullName,
          email: emp.email,
          department: emp.department?.name,
          hireDate: emp.hireDate,
        })),
      };
    });

    return {
      positions: analysis,
      summary: {
        totalPositions: positions.length,
        totalEmployeesInPositions: positions.reduce(
          (sum, pos) => sum + pos.employees.length,
          0,
        ),
        avgSalary: analysis.reduce((sum, pos) => sum + pos.metrics.avgSalary, 0) / analysis.length,
      },
    };
  }
}