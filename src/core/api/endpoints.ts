
export const ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',

        VALIDATE_STEP: '/auth/validate-step', // New Endpoint
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        ME: '/auth/me',
        UPDATE_PROFILE: '/auth/profile/update',
        UPDATE_PASSWORD: '/auth/password/update',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        VERIFY_SMS: '/auth/verify-sms',
    },

    // Courses
    COURSES: {
        LIST: '/courses',
        DETAIL: (id: string) => `/courses/${id}`,
        ENROLL: (id: string) => `/courses/${id}/enroll`,
        MY_COURSES: '/student/courses',
        LESSONS: (courseId: string) => `/courses/${courseId}/lessons`,
        LESSON_DETAIL: (courseId: string, lessonId: string) =>
            `/courses/${courseId}/lessons/${lessonId}`,
    },

    // Video Player
    PLAYER: {
        OTP: (id: string) => `/videos/${id}/otp`,
        PROGRESS: (id: string) => `/player/progress/${id}`,
        COMPLETE: (id: string) => `/lessons/${id}/complete`,
    },

    // Exams
    EXAMS: {
        LIST: '/exams',
        DETAIL: (id: string) => `/exams/${id}`,
        START: (id: string) => `/exams/${id}/start`,
        SUBMIT: (id: string) => `/exams/${id}/submit`,
        RESULT: (id: string) => `/exams/${id}/result`,
    },

    // Wallet
    WALLET: {
        BALANCE: '/wallet/balance',
        TRANSACTIONS: '/wallet/transactions',
        DEPOSIT: '/wallet/deposit',
        FAWRY_CALLBACK: '/wallet/fawry/callback',
    },

    // Dashboard
    DASHBOARD: {
        STATS: '/dashboard/stats',
        RECENT_ACTIVITY: '/dashboard/activity',
        NOTIFICATIONS: '/dashboard/notifications',
    },

    // Teacher functionality (now handled by Admin)
    TEACHER: {
        DASHBOARD: {
            STATS: '/admin/dashboard/stats',
        },
        FILES: {
            UPLOAD: '/admin/files/upload',
            LIST: '/admin/files',
            DELETE: (id: string) => `/admin/files/${id}/delete`,
        },
    },

    // Support
    SUPPORT: {
        TICKETS: '/support/tickets',
        CREATE_TICKET: '/support/tickets',
        TICKET_DETAIL: (id: string) => `/support/tickets/${id}`,
        REPLY: (id: string) => `/support/tickets/${id}/reply`,
        CONTACT_MESSAGES: '/admin/contact-messages',
        UPDATE_CONTACT_STATUS: (id: string) => `/admin/contact-messages/${id}/status`,
        REPLY_CONTACT_MESSAGE: (id: string) => `/admin/contact-messages/${id}/reply`,
    },

    // Admin
    ADMIN: {
        USERS: '/admin/users',
        USER_DETAIL: (id: string) => `/admin/users/${id}`,
        APPROVE_USER: (id: string) => `/admin/users/${id}/approve`,
        BLOCK_USER: (id: string) => `/admin/users/${id}/block`,

        // Student Requests
        LIST_PENDING_REQUESTS: '/admin/requests/pending',
        APPROVE_REQUEST: (id: string) => `/admin/requests/${id}/approve`,
        REJECT_REQUEST: (id: string) => `/admin/requests/${id}/reject`,

        // Students Management
        LIST_ACTIVE_STUDENTS: '/admin/students/active',
        GET_STUDENT_STATS: '/admin/students/stats',
        UPDATE_STUDENT_STATUS: (id: string) => `/admin/students/${id}/status`,
        UPDATE_STUDENT: (id: string) => `/admin/students/${id}/update`,
        DELETE_STUDENT: (id: string) => `/admin/students/${id}/delete`,
        STUDENT_COURSES_DETAIL: (id: string) => `/admin/students/${id}/courses`,

        // Assistants Management
        ASSISTANTS: {
            LIST: '/admin/assistants',
            CREATE: '/admin/assistants',
            UPDATE: (id: string) => `/admin/assistants/${id}/update`,
            DELETE: (id: string) => `/admin/assistants/${id}/delete`,
        },

        // Courses Management
        COURSES: {
            LIST: '/admin/courses',
            CREATE: '/admin/courses',
            DETAIL: (id: string) => `/admin/courses/${id}`,
            UPDATE: (id: string) => `/admin/courses/${id}/update`,
            DELETE: (id: string) => `/admin/courses/${id}/delete`,
            UPLOAD_THUMBNAIL: '/admin/courses/upload-thumbnail',
            SECTIONS: (courseId: string) => `/admin/courses/${courseId}/sections`,
        },

        // Sections Management
        SECTIONS: {
            UPDATE: (id: string) => `/admin/sections/${id}/update`,
            DELETE: (id: string) => `/admin/sections/${id}/delete`,
            LESSONS: (sectionId: string) => `/admin/sections/${sectionId}/lessons`,
        },

        // Lessons Management
        LESSONS: {
            UPDATE: (id: string) => `/admin/lessons/${id}/update`,
            DELETE: (id: string) => `/admin/lessons/${id}/delete`,
        },
    },

    // Weekly Evaluations
    EVALUATIONS: {
        LIST: '/evaluations',
        ADMIN_CREATE: '/admin/evaluations',
        ADMIN_DELETE: (id: string) => `/admin/evaluations/${id}`,
    },
} as const;
