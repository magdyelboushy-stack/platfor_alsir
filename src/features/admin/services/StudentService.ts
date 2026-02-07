import { BaseService } from '@/core/services/BaseService';

export interface Student {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string | null;
    gradeLevel: string;
    educationStage: string;
    governorate: string;
    city: string;
    status: 'active' | 'blocked' | 'pending';
    joinedAt: string;
    parentPhone?: string;
    guardianName?: string;
}

export class StudentService extends BaseService {
    private static instance: StudentService;

    private constructor() {
        super();
    }

    public static getInstance(): StudentService {
        if (!StudentService.instance) {
            StudentService.instance = new StudentService();
        }
        return StudentService.instance;
    }

    async getAllStudents(): Promise<Student[]> {
        return this.get<Student[]>('/admin/students/active');
    }

    async getStudentById(id: string): Promise<Student> {
        return this.get<Student>(`/admin/students/${id}`);
    }

    async updateStatus(id: string, status: 'active' | 'blocked'): Promise<void> {
        await this.patch(`/admin/students/${id}/status`, { status });
    }

    async getStudentDetails(id: string): Promise<any> {
        return this.get(`/admin/students/${id}/courses`);
    }

    async deleteStudent(id: string): Promise<void> {
        await this.delete(`/admin/students/${id}/delete`);
    }
}

export const studentService = StudentService.getInstance();
