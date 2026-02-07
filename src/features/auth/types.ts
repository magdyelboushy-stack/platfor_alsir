// ============================================================
// Auth Types - E-learning Platform
// ============================================================

import type { UserRole } from '@/core/types/common';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    // Step 1: Personal Info
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;

    // Step 2: Academic Info
    role: UserRole;
    gradeLevel?: string; // For students
    schoolName?: string;
    parentPhone?: string; // For students

    // Step 3: Document Upload
    nationalId?: File;
    studentId?: File;
    profilePhoto?: File;
}

export interface RegisterStep {
    id: number;
    title: string;
    description: string;
    isCompleted: boolean;
    isActive: boolean;
}

export interface RegistrationStatus {
    status: 'pending' | 'approved' | 'rejected' | 'blocked';
    message?: string;
    submittedAt: string;
    reviewedAt?: string;
}

export interface ForgotPasswordData {
    email: string;
}

export interface ResetPasswordData {
    token: string;
    password: string;
    confirmPassword: string;
}
