<?php

return [
    'POST' => [
        // Auth Routes
        '/api/auth/register' => ['App\\Controllers\\Auth\\Register', 'handle'],
        '/api/auth/register-staff' => ['App\\Controllers\\Auth\\RegisterStaff', 'handle'],
        '/api/auth/login' => ['App\\Controllers\\Auth\\Login', 'handle'],
        '/api/auth/validate-step' => ['App\\Controllers\\Auth\\Validation', 'check'],
        '/api/auth/profile/update' => ['App\\Controllers\\Auth\\ProfileUpdate', 'handle'],
        '/api/auth/password/update' => ['App\\Controllers\\Auth\\PasswordUpdate', 'handle'],
        '/api/auth/verify-sms' => ['App\\Controllers\\Auth\\SmsVerify', 'handle'],
        '/api/webhooks/telegram' => ['App\\Controllers\\Webhooks\\TelegramWebhook', 'handle'],
        
        // Public Contact
        '/api/contact' => ['App\\Controllers\\ContactController', 'handle'],
        
        // Admin Requests
        '/api/admin/requests/{id}/approve' => ['App\\Controllers\\Admin\\RequestsController', 'approve'],
        '/api/admin/requests/{id}/reject' => ['App\\Controllers\\Admin\\RequestsController', 'reject'],
        
        // Assistant Management
        '/api/admin/assistants' => ['App\\Controllers\\Admin\\AssistantsController', 'create'],
        '/api/admin/assistants/{id}/update' => ['App\\Controllers\\Admin\\AssistantsController', 'update'],
        '/api/admin/assistants/{id}/delete' => ['App\\Controllers\\Admin\\AssistantsController', 'delete'],

        // Student Management
        '/api/admin/students/{id}/status' => ['App\\Controllers\\Admin\\StudentsController', 'updateStatus'],
        '/api/admin/students/{id}/update' => ['App\\Controllers\\Admin\\StudentsController', 'update'],
        '/api/admin/students/{id}/delete' => ['App\\Controllers\\Admin\\StudentsController', 'delete'],

        // Courses Management
        '/api/admin/courses/upload-thumbnail' => ['App\\Controllers\\Admin\\CoursesController', 'uploadThumbnail'],
        '/api/admin/courses' => ['App\\Controllers\\Admin\\CoursesController', 'store'],
        '/api/admin/courses/{id}/update' => ['App\\Controllers\\Admin\\CoursesController', 'update'],
        '/api/admin/courses/{id}/delete' => ['App\\Controllers\\Admin\\CoursesController', 'delete'],
        '/api/admin/courses/upload-thumbnail' => ['App\\Controllers\\Admin\\CourseUploadController', 'uploadThumbnail'],
        '/api/courses/{id}/enroll' => ['App\\Controllers\\CoursesController', 'enroll'],

        // Sections Management
        '/api/admin/courses/{courseId}/sections' => ['App\\Controllers\\Admin\\SectionsController', 'store'],
        '/api/admin/sections/{id}/update' => ['App\\Controllers\\Admin\\SectionsController', 'update'],
        '/api/admin/sections/{id}/delete' => ['App\\Controllers\\Admin\\SectionsController', 'delete'],

        // Lessons Management
        '/api/admin/sections/{sectionId}/lessons' => ['App\\Controllers\\Admin\\LessonsController', 'store'],
        '/api/admin/lessons/{id}/update' => ['App\\Controllers\\Admin\\LessonsController', 'update'],
        '/api/admin/lessons/{id}/delete' => ['App\\Controllers\\Admin\\LessonsController', 'delete'],

        // Progression
        '/api/lessons/{id}/complete' => ['App\\Controllers\\ProgressController', 'complete'],
        '/api/player/progress/{id}' => ['App\\Controllers\\ProgressController', 'updateTimestamp'],
        
        // VdoCipher
        '/api/videos/{id}/otp' => ['App\\Controllers\\VdoCipherController', 'getOTP'],

        // Admin Files Upload (moved from teacher)
        '/api/admin/files/upload' => ['App\\Controllers\\Admin\\FilesUploadController', 'upload'],
        '/api/admin/files/{id}/delete' => ['App\\Controllers\\Admin\\FilesUploadController', 'delete'],
        
        // System Settings
        '/api/admin/settings' => ['App\\Controllers\\Admin\\SettingsController', 'update'],
        
        // Admin Exam Management (moved from teacher)
        '/api/admin/exams' => ['App\\Controllers\\Admin\\ExamsController', 'store'],
        '/api/admin/exams/{id}/update' => ['App\\Controllers\\Admin\\ExamsController', 'update'],
        '/api/admin/exams/{id}/delete' => ['App\\Controllers\\Admin\\ExamsController', 'delete'],

        // Student Exam Actions
        '/api/exams/{id}/start' => ['App\\Controllers\\ExamController', 'start'],
        '/api/exams/{id}/submit' => ['App\\Controllers\\ExamController', 'submit'],

        // Admin Codes Management (moved from teacher)
        '/api/admin/codes' => ['App\\Controllers\\Admin\\CodesController', 'store'],

        // Student Code Redemption
        '/api/codes/redeem' => ['App\\Controllers\\Admin\\CodesController', 'redeem'],

        // Weekly Evaluations
        '/api/admin/evaluations' => ['App\\Controllers\\WeeklyEvaluations', 'create'],
        '/api/evaluations/{id}/download' => ['App\\Controllers\\WeeklyEvaluations', 'incrementDownload'],
    
        // Referral System Routes
        '/api/evaluations/{id}/referral' => ['App\\Controllers\\WeeklyEvaluations', 'createReferral'],
        '/api/referrals/{token}/visit' => ['App\\Controllers\\WeeklyEvaluations', 'recordReferralVisit'],
        
        // Admin Contact Messages
        '/api/admin/contact-messages/{id}/status' => ['App\\Controllers\\ContactController', 'updateStatus'],
        '/api/admin/contact-messages/{id}/reply' => ['App\\Controllers\\ContactController', 'reply'],
    ],
    'GET' => [
        '/api/contact' => ['App\\Controllers\\ContactController', 'info'],
        '/api/admin/contact-messages' => ['App\\Controllers\\ContactController', 'list'],
        '/api/csrf-token' => ['App\\Controllers\\Security\\CSRFController', 'getToken'],
        '/api/webhooks/telegram/setup' => ['App\\Controllers\\Webhooks\\TelegramWebhook', 'setup'],
        '/api/auth/me' => ['App\\Controllers\\Auth\\Me', 'handle'],
        '/api/files/{type}/{filename}' => ['App\\Controllers\\FileController', 'serve'],
        
        // Admin Requests
        '/api/admin/requests/pending' => ['App\\Controllers\\Admin\\RequestsController', 'listPending'],

        // Admin Students Management
        '/api/admin/students/active' => ['App\\Controllers\\Admin\\StudentsController', 'listActive'],
        '/api/admin/students/stats' => ['App\\Controllers\\Admin\\StudentsController', 'getStats'],
        '/api/admin/students/{id}' => ['App\\Controllers\\Admin\\StudentsController', 'show'],
        '/api/admin/students/{id}/courses' => ['App\\Controllers\\Admin\\StudentsController', 'courseDetails'],

        // Assistant Management
        '/api/admin/assistants' => ['App\\Controllers\\Admin\\AssistantsController', 'index'],

        // Courses Management
        '/api/admin/courses' => ['App\\Controllers\\Admin\\CoursesController', 'index'],
        '/api/admin/courses/{id}' => ['App\\Controllers\\Admin\\CoursesController', 'show'],
        '/api/admin/courses/{id}/sections' => ['App\\Controllers\\Admin\\SectionsController', 'index'],

        // Public Lessons
        '/api/sections/{sectionId}/lessons' => ['App\\Controllers\\Admin\\LessonsController', 'index'],
        
        // Public Course Routes
        '/api/courses' => ['App\\Controllers\\CoursesController', 'index'],
        '/api/courses/{id}' => ['App\\Controllers\\CoursesController', 'show'],
        '/api/student/courses' => ['App\\Controllers\\CoursesController', 'studentCourses'],
        
        // Student Exam Detail
        '/api/exams/{id}' => ['App\\Controllers\\ExamController', 'show'],
        // Student Results
        '/api/student/exam-results' => ['App\\Controllers\\ExamController', 'myResults'],
        // Student Review
        '/api/exams/review/{id}' => ['App\\Controllers\\ExamController', 'review'],

        // Dashboard (student)
        '/api/dashboard/stats' => ['App\\Controllers\\DashboardController', 'stats'],
        '/api/dashboard/courses' => ['App\\Controllers\\CoursesController', 'studentCourses'],
        '/api/dashboard/exams' => ['App\\Controllers\\DashboardController', 'exams'],
        '/api/dashboard/activity' => ['App\\Controllers\\DashboardController', 'activity'],
        '/api/dashboard/wallet/history' => ['App\\Controllers\\DashboardController', 'walletHistory'],

        // Admin Dashboard (combined admin + teacher stats)
        '/api/admin/dashboard/stats' => ['App\\Controllers\\Admin\\AdminDashboardController', 'stats'],
        '/api/admin/dashboard/activity' => ['App\\Controllers\\Admin\\AdminDashboardController', 'activity'],
        
        // Admin Files List (moved from teacher)
        '/api/admin/files' => ['App\\Controllers\\Admin\\FilesUploadController', 'index'],
        
        // Admin Exams List (moved from teacher)
        '/api/admin/exams' => ['App\\Controllers\\Admin\\ExamsController', 'index'],
        '/api/admin/exams/{id}' => ['App\\Controllers\\Admin\\ExamsController', 'show'],
        '/api/admin/courses/{courseId}/exams' => ['App\\Controllers\\Admin\\ExamsController', 'index'],

        // Admin Codes List (moved from teacher)
        '/api/admin/codes' => ['App\\Controllers\\Admin\\CodesController', 'index'],
        '/api/admin/codes/stats' => ['App\\Controllers\\Admin\\CodesController', 'stats'],
        '/api/admin/my-courses' => ['App\\Controllers\\Admin\\CodesController', 'myCourses'],
        '/api/admin/my-students' => ['App\\Controllers\\Admin\\CodesController', 'myStudents'],
        
        // Permissions API (RBAC)
        '/api/admin/permissions/registry' => ['App\\Controllers\\Admin\\PermissionsController', 'registry'],
        '/api/admin/permissions/current' => ['App\\Controllers\\Admin\\PermissionsController', 'current'],
        
        // Financial Reports
        '/api/admin/reports' => ['App\\Controllers\\Admin\\ReportsController', 'index'],

        // Activity Logs
        '/api/admin/logs' => ['App\\Controllers\\Admin\\ActivityLogsController', 'index'],

        // System Settings
        '/api/admin/settings' => ['App\\Controllers\\Admin\\SettingsController', 'index'],

        // Weekly Evaluations (Public)
        '/api/evaluations' => ['App\\Controllers\\WeeklyEvaluations', 'index'],
        '/api/evaluations/{id}/referral-status' => ['App\\Controllers\\WeeklyEvaluations', 'checkReferralStatus'],
    ],
    'PATCH' => [
        // No teacher routes anymore
    ],
    'DELETE' => [
        // Weekly Evaluations
        '/api/admin/evaluations/{id}' => ['App\\Controllers\\WeeklyEvaluations', 'delete'],
    ]
];
