// ============================================================
// Core Types - Updated
// ============================================================

export type UserRole = 'student' | 'parent' | 'teacher' | 'support' | 'admin' | 'assistant';

export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role: UserRole;
    status: 'pending' | 'active' | 'blocked';
    bio?: string;
    grade_level?: string | number;
    education_stage?: string;
    phone?: string;
    parent_phone?: string;
    governorate?: string;
    city?: string;
    createdAt?: string;
    permissions?: string[];
}

export interface AuthTokens {
    accessToken?: string;
    token?: string;
    refreshToken?: string;
    expiresIn?: number;
}

export interface ApiError {
    message: string;
    error?: string; // Added to match backend responses
    errors?: Record<string, string[]>;
    code?: string;
}

export interface Teacher extends User {
    subject: string;
    rating: number;
    studentsCount: number;
    coursesCount: number;
    description: string;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    instructor: {
        id: string;
        name: string;
        avatar?: string;
    };
    price: number;
    rating: number;
    studentsCount: number;
    lessonsCount: number;
    duration: number; // minutes
}

export interface EvaluationFile {
    file_path: string;
    file_type: 'image' | 'pdf';
    url: string;
}

export interface Evaluation {
    id: string;
    title: string;
    description: string;
    education_stage: 'primary' | 'prep' | 'secondary';
    grade_level: number;
    subject: string;
    resource_type: 'evaluation' | 'study_material';
    downloads_count: number;
    files: EvaluationFile[];
    created_at: string;
    updated_at: string;
}
