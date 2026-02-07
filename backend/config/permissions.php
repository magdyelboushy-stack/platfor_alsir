<?php
/**
 * Permission Registry
 * Central configuration for all module permissions
 * 
 * Format: module => [ label, actions => [ key => label ] ]
 */

return [
    'modules' => [
        'dashboard' => [
            'label' => 'لوحة التحكم',
            'icon' => 'LayoutDashboard',
            'actions' => [
                'view' => 'عرض الإحصائيات العامة'
            ],
            'default' => true // Assistants get this by default (read-only)
        ],
        'courses' => [
            'label' => 'إدارة الكورسات',
            'icon' => 'BookOpen',
            'actions' => [
                'view' => 'عرض الكورسات',
                'create' => 'إنشاء كورس',
                'edit' => 'تعديل كورس',
                'delete' => 'حذف كورس'
            ]
        ],
        'exams' => [
            'label' => 'بنك الأسئلة',
            'icon' => 'FileSpreadsheet',
            'actions' => [
                'view' => 'عرض الامتحانات',
                'create' => 'إنشاء امتحان',
                'edit' => 'تعديل امتحان',
                'delete' => 'حذف امتحان'
            ]
        ],
        'files' => [
            'label' => 'مكتبة الملفات',
            'icon' => 'HardDrive',
            'actions' => [
                'view' => 'عرض الملفات',
                'upload' => 'رفع ملف',
                'delete' => 'حذف ملف'
            ]
        ],
        'codes' => [
            'label' => 'أكواد التفعيل',
            'icon' => 'Ticket',
            'actions' => [
                'view' => 'عرض الأكواد',
                'generate' => 'توليد أكواد',
                'delete' => 'حذف أكواد'
            ]
        ],
        'students' => [
            'label' => 'الطلاب والمتابعة',
            'icon' => 'Users',
            'actions' => [
                'view' => 'عرض الطلاب',
                'edit' => 'تعديل بيانات طالب',
                'suspend' => 'إيقاف/تفعيل طالب',
                'delete' => 'حذف طالب'
            ]
        ],
        'requests' => [
            'label' => 'طلبات الدخول',
            'icon' => 'ShieldAlert',
            'actions' => [
                'view' => 'عرض الطلبات',
                'approve' => 'قبول طلب',
                'reject' => 'رفض طلب'
            ]
        ],
        'wallet' => [
            'label' => 'المحفظة',
            'icon' => 'Wallet',
            'actions' => [
                'view' => 'عرض المحفظة والإيرادات',
                'withdraw' => 'سحب رصيد'
            ],
            'sensitive' => true // Financial data - never shown on dashboard unless explicitly granted
        ],
        'support' => [
            'label' => 'الدعم الفني',
            'icon' => 'MessageSquare',
            'actions' => [
                'view' => 'عرض التذاكر',
                'respond' => 'الرد على التذاكر'
            ]
        ],
        'homework' => [
            'label' => 'تصحيح الواجبات',
            'icon' => 'FileText',
            'actions' => [
                'view' => 'عرض الواجبات',
                'grade' => 'تصحيح الواجبات'
            ]
        ]
    ],
    
    // Modules that ONLY teachers can access (never assignable to assistants)
    'teacher_only' => [
        'assistants:view',
        'assistants:create',
        'assistants:edit',
        'assistants:delete'
    ],
    
    // Route to permission mapping
    'routes' => [
        // Students routes
        'GET:/api/admin/students' => 'students:view',
        'POST:/api/admin/students/status' => 'students:suspend',
        'DELETE:/api/admin/students' => 'students:delete',
        
        // Courses routes  
        'GET:/api/admin/courses' => 'courses:view',
        'POST:/api/admin/courses' => 'courses:create',
        'PUT:/api/admin/courses' => 'courses:edit',
        'DELETE:/api/admin/courses' => 'courses:delete',
        
        // Exams routes
        'GET:/api/admin/exams' => 'exams:view',
        'POST:/api/admin/exams' => 'exams:create',
        'PUT:/api/admin/exams' => 'exams:edit',
        'DELETE:/api/admin/exams' => 'exams:delete',
        
        // Files routes
        'GET:/api/admin/files' => 'files:view',
        'POST:/api/admin/files' => 'files:upload',
        'DELETE:/api/admin/files' => 'files:delete',
        
        // Codes routes
        'GET:/api/admin/codes' => 'codes:view',
        'POST:/api/admin/codes' => 'codes:generate',
        'DELETE:/api/admin/codes' => 'codes:delete',
        
        // Requests routes
        'GET:/api/admin/requests' => 'requests:view',
        'POST:/api/admin/requests/approve' => 'requests:approve',
        'POST:/api/admin/requests/reject' => 'requests:reject',
        
        // Wallet routes
        'GET:/api/admin/wallet' => 'wallet:view',
        'POST:/api/admin/wallet/withdraw' => 'wallet:withdraw',
        
        // Support routes
        'GET:/api/admin/support' => 'support:view',
        'POST:/api/admin/support' => 'support:respond',
        
        // Homework routes
        'GET:/api/admin/homework' => 'homework:view',
        'POST:/api/admin/homework/grade' => 'homework:grade'
    ]
];
