# السير الشامي - منصة التعليم الإلكتروني
# Al-Seer Al-Shami E-Learning Platform
## Technical Documentation | التوثيق التقني

---

## 1. Platform Overview | نظرة عامة على المنصة

### English

**Al-Seer Al-Shami (السير الشامي)** is a comprehensive e-learning platform designed specifically for the Egyptian educational market. The platform provides a secure, scalable environment for online education delivery with a focus on video content protection and exam integrity.

**Target Users:**
- **Students**: Primary, preparatory, and secondary school students
- **Teachers**: Subject matter experts who create and manage courses
- **Assistants**: Teacher helpers with delegated permissions
- **Administrators**: Platform managers with full system control
- **Parents**: Guardians with view-only access to student progress

**Key Problems Solved:**
1. **Video Content Protection**: Prevents unauthorized downloading and sharing of educational videos through VdoCipher integration with dynamic watermarking
2. **Exam Integrity**: Anti-cheating mechanisms including fullscreen enforcement, tab-switch detection, and attempt limiting
3. **Scalable Course Management**: Hierarchical course structure with sections, lessons, and progress tracking
4. **Role-Based Access Control**: Granular permissions ensuring data isolation between teachers
5. **Activation Code System**: Secure course enrollment through teacher-generated codes

### Arabic

**السير الشامي** هي منصة تعليمية إلكترونية شاملة مصممة خصيصاً للسوق التعليمي المصري. توفر المنصة بيئة آمنة وقابلة للتوسع لتقديم التعليم عبر الإنترنت مع التركيز على حماية محتوى الفيديو ونزاهة الاختبارات.

**المستخدمون المستهدفون:**
- **الطلاب**: طلاب المرحلة الابتدائية والإعدادية والثانوية
- **المعلمون**: خبراء المواد الذين ينشئون ويديرون الكورسات
- **المساعدون**: مساعدو المعلمين بصلاحيات مفوضة
- **المدراء**: مديرو المنصة بتحكم كامل بالنظام
- **أولياء الأمور**: الأوصياء بصلاحية عرض فقط لتقدم الطالب

**المشاكل الرئيسية التي تحلها:**
1. **حماية محتوى الفيديو**: منع التحميل والمشاركة غير المصرح بها للفيديوهات التعليمية من خلال تكامل VdoCipher مع العلامات المائية الديناميكية
2. **نزاهة الاختبارات**: آليات مكافحة الغش تشمل فرض ملء الشاشة، كشف تبديل التبويبات، وتحديد المحاولات
3. **إدارة الكورسات القابلة للتوسع**: هيكل كورس هرمي مع أقسام ودروس وتتبع التقدم
4. **التحكم في الوصول القائم على الأدوار**: صلاحيات دقيقة تضمن عزل البيانات بين المعلمين
5. **نظام أكواد التفعيل**: تسجيل آمن في الكورسات من خلال أكواد يولدها المعلم

---

## 2. System Architecture | هندسة النظام

### English

#### Frontend Technologies
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Zustand | State Management |
| TailwindCSS | Styling |
| React Router v6 | Routing |
| Axios | HTTP Client |
| Framer Motion | Animations |

#### Backend Technologies
| Technology | Purpose |
|------------|---------|
| PHP 8.x | Server Language |
| Custom MVC | Framework |
| MySQL/MariaDB | Database |
| Apache | Web Server |
| VdoCipher | Video DRM |

#### Database Design
- **Character Set**: UTF8MB4 (Arabic support)
- **Primary Keys**: UUID v4
- **Engine**: InnoDB with foreign keys

#### Architecture Diagram
```
┌─────────────────┐     HTTPS      ┌─────────────────┐      PDO       ┌─────────────────┐
│  React Frontend │ ◄────────────► │  PHP Backend    │ ◄────────────► │     MySQL       │
│  (Vite/TS)      │                │  (Custom MVC)   │                │   Database      │
└─────────────────┘                └────────┬────────┘                └─────────────────┘
                                            │
                                            ▼
                                   ┌─────────────────┐
                                   │   VdoCipher     │
                                   │   (Video DRM)   │
                                   └─────────────────┘
```

### Arabic

#### تقنيات الواجهة الأمامية
- **الإطار**: React 18 مع TypeScript
- **أداة البناء**: Vite
- **إدارة الحالة**: Zustand
- **التنسيق**: TailwindCSS

#### تقنيات الخلفية
- **اللغة**: PHP 8.x
- **قاعدة البيانات**: MySQL/MariaDB
- **استضافة الفيديو**: VdoCipher

---

## 3. Authentication & Authorization | المصادقة والتفويض

### English

#### Authentication Flow
```
1. Client fetches CSRF token ──► GET /csrf-token
2. User submits credentials ──► POST /auth/login
3. Server validates against multiple tables (admins→teachers→assistants→users)
4. Password verified using Argon2id
5. Session created with regenerated ID
6. User data + role returned
```

#### Role-Based Access Control (RBAC)

| Role | Access Level | Data Scope |
|------|--------------|------------|
| Admin | Full platform access | All teachers, all data |
| Teacher | Full course management | Own courses and students only |
| Assistant | Delegated permissions | Teacher's data based on permissions array |
| Student | Consumer access | Enrolled courses only |
| Parent | View-only | Linked student's progress |

#### Session Security
- HTTP-only cookies
- SameSite=Lax
- 30-minute session regeneration
- IP/User-Agent validation
- Database-backed storage

### Arabic

#### تدفق المصادقة
1. العميل يطلب رمز CSRF
2. المستخدم يرسل بيانات الاعتماد
3. الخادم يتحقق عبر جداول متعددة
4. التحقق من كلمة المرور باستخدام Argon2id
5. إنشاء جلسة بمعرف متجدد
6. إرجاع بيانات المستخدم والدور

---

## 4. Security Model | نموذج الأمان

### English

#### Password Security
```php
// Argon2id (Primary - GPU-resistant)
PASSWORD_ARGON2ID:
  - memory_cost: 65536 (64 MB)
  - time_cost: 4 iterations
  - threads: 3

// bcrypt (Fallback)
PASSWORD_BCRYPT:
  - cost: 12
```

#### Security Headers
| Header | Value |
|--------|-------|
| X-XSS-Protection | 1; mode=block |
| X-Frame-Options | SAMEORIGIN |
| X-Content-Type-Options | nosniff |
| Content-Security-Policy | Strict CSP |
| Strict-Transport-Security | max-age=31536000 (production) |
| Referrer-Policy | strict-origin-when-cross-origin |

#### Protection Mechanisms

| Attack Type | Protection |
|-------------|------------|
| SQL Injection | PDO Prepared Statements |
| XSS | Input encoding, CSP, React escaping |
| CSRF | Double-submit tokens, SameSite cookies |
| Session Hijacking | HttpOnly, IP/UA validation, regeneration |
| Brute Force | Rate limiting (5 attempts/30 min lockout) |
| IDOR | Ownership verification middleware |

#### Data Isolation
- Teacher data isolated via `teacher_id` foreign key
- Query-level ownership conditions
- Middleware enforces resource ownership
- Assistants scoped to single teacher

### Arabic

#### أمان كلمات المرور
- **الأساسي**: Argon2id بذاكرة 64 ميجابايت
- **البديل**: bcrypt بتكلفة 12
- **سجل كلمات المرور**: يمنع إعادة استخدام كلمات المرور القديمة

#### آليات الحماية
| نوع الهجوم | الحماية |
|-------------|------------|
| حقن SQL | استعلامات محضرة PDO |
| XSS | ترميز المدخلات، CSP |
| CSRF | رموز مزدوجة، ملفات تعريف ارتباط SameSite |
| اختطاف الجلسة | HttpOnly، تحقق IP/UA |
| القوة الغاشمة | تحديد المعدل (5 محاولات/قفل 30 دقيقة) |

---

## 5. Course System | نظام الكورسات

### English

#### Course Structure
```
Course
├── Metadata (title, description, price, stage, grade)
├── Sections (Units/Chapters)
│   └── Lessons
│       ├── Video (VdoCipher ID)
│       ├── PDF (file URL)
│       └── Exam (linked exam)
└── Enrollments
```

#### Content Types
| Type | Description |
|------|-------------|
| video | VdoCipher DRM-protected video |
| pdf | Downloadable PDF document |
| exam | Linked examination |

#### Enrollment Methods
1. **Activation Codes**: Teacher generates codes, students redeem
2. **Free Courses**: Auto-access if student grade matches course grade

#### Progress Tracking
- **Lesson Level**: Completion status + watch time
- **Course Level**: Percentage calculated from completed lessons
- **Video Completion Gate**: 95% watch time required
- **Resume Feature**: `watched_seconds` stored for video resume

### Arabic

#### هيكل الكورس
```
الكورس
├── البيانات الوصفية (العنوان، الوصف، السعر، المرحلة، الصف)
├── الأقسام (الوحدات/الفصول)
│   └── الدروس
│       ├── فيديو (معرف VdoCipher)
│       ├── PDF (رابط الملف)
│       └── اختبار (اختبار مرتبط)
└── التسجيلات
```

#### استئناف الفيديو
**تم التنفيذ**: نعم - حقل `watched_seconds` يخزن موضع التشغيل ويستخدم لاستئناف الفيديو من حيث توقف الطالب.

---

## 6. Student Management | إدارة الطلاب

### English

#### Student Profile Fields
- Name, Email, Phone
- Parent Phone
- Education Stage (primary/prep/secondary)
- Grade Level (first/second/third)
- Governorate, City
- Avatar

#### Access Rules
| Condition | Access |
|-----------|--------|
| Active enrollment | Full course access |
| Free course + matching grade | Full course access |
| No enrollment | Preview lessons only |

#### Attempt Limitations
- **Exam Attempts**: Configurable per exam (default: 1)
- **Unique Constraint**: One attempt per student per exam
- **Staff Exception**: Admins/teachers can preview unlimited

### Arabic

#### حقول ملف الطالب
- الاسم، البريد الإلكتروني، الهاتف
- هاتف ولي الأمر
- المرحلة التعليمية
- الصف الدراسي
- المحافظة، المدينة

---

## 7. Teacher & Assistant System | نظام المعلم والمساعد

### English

#### Teacher Capabilities
- Create/edit/delete own courses
- Manage sections and lessons
- Upload videos to VdoCipher
- Generate activation codes
- Create and manage exams
- View enrolled students
- Manage assistants

#### Assistant Permissions (Granular)
```json
[
  "students",
  "students:view",
  "students:edit",
  "courses",
  "courses:view",
  "codes",
  "codes:generate",
  "exams",
  "exams:create",
  "wallet",
  "files"
]
```

#### Privacy Enforcement
Teachers CANNOT access:
- Other teachers' courses
- Other teachers' students
- Other teachers' revenue
- Platform settings

### Arabic

#### قدرات المعلم
- إنشاء/تعديل/حذف كورساته
- إدارة الأقسام والدروس
- رفع الفيديوهات إلى VdoCipher
- إنشاء أكواد التفعيل
- إنشاء وإدارة الاختبارات
- عرض الطلاب المسجلين
- إدارة المساعدين

#### صلاحيات المساعد
مصفوفة صلاحيات JSON دقيقة تحدد ما يمكن للمساعد الوصول إليه.

---

## 8. Exam System | نظام الاختبارات

### English

#### Exam Configuration
| Setting | Description |
|---------|-------------|
| duration_minutes | Time limit |
| pass_score | Minimum passing percentage |
| max_attempts | Allowed retakes |
| is_randomized | Shuffle questions |
| anti_cheat_enabled | Enable proctoring |
| show_results | Show answers after submit |

#### Question Types
| Type | Description |
|------|-------------|
| single | Single choice (radio) |
| multiple | Multiple choice (checkbox) |
| true_false | True/False |
| essay | Free text (manual grading) |

#### Anti-Cheating Measures

**Frontend Protections:**
| Protection | Implementation |
|------------|----------------|
| Fullscreen Mode | Required to start exam |
| Tab Switch Detection | visibilitychange listener |
| Fullscreen Exit Detection | fullscreenchange listener |
| Right-Click Block | contextmenu prevented |
| Keyboard Shortcut Block | Ctrl+C/V, F12 blocked |
| Text Selection Block | CSS user-select: none |
| Copy/Paste Block | Clipboard events prevented |
| Reload Warning | beforeunload confirmation |
| Warning System | 2 warnings before auto-submit |

**Backend Logging:**
```sql
anti_cheat_logs (
  id, attempt_id, event_type, logged_at, metadata
)
-- event_type: tab_switch, copy_paste, right_click, 
--             fullscreen_exit, devtools, screenshot
```

### Arabic

#### تكوين الاختبار
| الإعداد | الوصف |
|---------|-------------|
| duration_minutes | الحد الزمني |
| pass_score | الحد الأدنى للنجاح |
| max_attempts | المحاولات المسموحة |
| is_randomized | ترتيب عشوائي للأسئلة |
| anti_cheat_enabled | تفعيل المراقبة |

#### آليات مكافحة الغش
- فرض ملء الشاشة
- كشف تبديل التبويب
- حظر النقر الأيمن
- حظر اختصارات لوحة المفاتيح
- تعطيل النسخ واللصق
- نظام تحذيرات (تحذيران قبل الإنهاء التلقائي)

---

## 9. Admin Panel | لوحة الإدارة

### English

#### Admin Capabilities
- View/manage all teachers
- Approve/reject teacher registrations
- Block/unblock any account
- Platform-wide statistics
- System settings (logo, name, colors)
- Activity logs
- Generate reports

#### Teacher Management
```
GET  /admin/teachers           - List all teachers
GET  /admin/teachers/:id       - Teacher details
POST /admin/teachers/:id/approve - Approve teacher
POST /admin/teachers/:id/block   - Block teacher
```

### Arabic

#### قدرات المدير
- عرض/إدارة جميع المعلمين
- الموافقة/رفض طلبات تسجيل المعلمين
- حظر/إلغاء حظر أي حساب
- إحصائيات المنصة الشاملة
- إعدادات النظام (الشعار، الاسم، الألوان)
- سجلات النشاط

---

## 10. Database Schema | مخطط قاعدة البيانات

### Main Tables

| Table | Purpose | الغرض |
|-------|---------|-------|
| users | Students & parents | الطلاب وأولياء الأمور |
| teachers | Teacher accounts | حسابات المعلمين |
| admins | Administrators | المدراء |
| assistants | Teacher assistants | مساعدو المعلمين |
| courses | Course metadata | بيانات الكورسات |
| course_sections | Units/chapters | الوحدات/الفصول |
| lessons | Individual lessons | الدروس |
| enrollments | Student-course link | ربط الطالب بالكورس |
| activation_codes | Access codes | أكواد التفعيل |
| lesson_progress | Watch progress | تقدم المشاهدة |
| exams | Exam definitions | تعريفات الاختبارات |
| exam_questions | Questions | الأسئلة |
| question_options | Answer options | خيارات الإجابة |
| exam_attempts | Student attempts | محاولات الطلاب |
| exam_answers | Submitted answers | الإجابات المقدمة |
| anti_cheat_logs | Violation records | سجلات المخالفات |
| sessions | User sessions | جلسات المستخدمين |
| audit_logs | Action audit | سجل الإجراءات |

### Entity Relationships
```
teachers ──< courses ──< course_sections ──< lessons
    │            │
    │            └──< enrollments >── users
    │            │
    │            └──< activation_codes
    │
    └──< assistants

exams ──< exam_questions ──< question_options
  │
  └──< exam_attempts ──< exam_answers
              │
              └──< anti_cheat_logs
```

---

## 11. API Reference | مرجع API

### Authentication
```
GET  /csrf-token          - Get CSRF token
POST /auth/login          - User login
POST /auth/register       - Student registration
GET  /auth/me             - Current user info
POST /auth/logout         - Logout
```

### Courses
```
GET  /courses             - List courses
GET  /courses/:id         - Course with content
POST /courses             - Create course (teacher)
PUT  /courses/:id         - Update course
```

### Progress
```
POST /progress/lessons/:id/complete   - Mark complete
POST /progress/lessons/:id/timestamp  - Update position
```

### Exams
```
GET  /exams/:id           - Get exam for taking
POST /exams/:id/start     - Start attempt
POST /exams/:id/submit    - Submit answers
```

### Videos
```
POST /videos/:id/otp      - Get VdoCipher playback OTP
```

### Admin
```
GET  /admin/dashboard     - Dashboard stats
GET  /admin/teachers      - List teachers
POST /admin/teachers/:id/approve - Approve teacher
```

---

## 12. Strengths | نقاط القوة

### Technical Advantages | المزايا التقنية

| Feature | Benefit |
|---------|---------|
| VdoCipher DRM | Prevents video downloading/recording |
| Dynamic Watermark | User identification on videos |
| Argon2id Hashing | GPU-resistant password security |
| Multi-layer Security | Defense in depth approach |
| Granular RBAC | Flexible permission system |
| Data Isolation | Complete teacher data separation |
| Anti-Cheat System | Comprehensive exam proctoring |
| Resume Feature | Video continues from last position |

### Arabic

| الميزة | الفائدة |
|---------|---------|
| VdoCipher DRM | يمنع تحميل/تسجيل الفيديو |
| العلامة المائية الديناميكية | تحديد هوية المستخدم على الفيديوهات |
| تجزئة Argon2id | أمان كلمة مرور مقاوم لـ GPU |
| أمان متعدد الطبقات | نهج دفاع في العمق |
| RBAC دقيق | نظام صلاحيات مرن |
| عزل البيانات | فصل كامل لبيانات المعلم |

---

## 13. Limitations & Roadmap | القيود وخارطة الطريق

### Current Limitations | القيود الحالية

| Feature | Status | الحالة |
|---------|--------|--------|
| Email Verification | Code ready, sending not configured | الكود جاهز، الإرسال غير مكوّن |
| Two-Factor Auth | Schema ready, UI not built | المخطط جاهز، الواجهة غير مبنية |
| Essay Grading | Manual grading UI missing | واجهة التصحيح اليدوي مفقودة |
| Parent Dashboard | Role exists, views not built | الدور موجود، العروض غير مبنية |
| Mobile App | Web only | ويب فقط |
| Payment Gateway | Codes only, no direct payment | أكواد فقط، لا دفع مباشر |
| Live Classes | Not implemented | غير منفذ |
| Certificates | Not implemented | غير منفذ |

### Suggested Improvements | التحسينات المقترحة

1. Redis session storage for scale
2. Background job queue for emails
3. WebSocket real-time notifications
4. CDN for static assets
5. Automated database backups
6. Mobile application

---

## Installation | التثبيت

### Requirements
- PHP 8.0+
- MySQL 8.0+ / MariaDB 10.5+
- Node.js 18+
- Apache with mod_rewrite

### Setup
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
composer install
# Configure .env with database credentials
# Import database schemas from /database/*.sql
```

---

## License | الترخيص

This software is proprietary to Al-Seer Al-Shami (السير الشامي).

---

**Document Version**: 1.0  
**Last Updated**: February 2026  
**Platform**: السير الشامي (Al-Seer Al-Shami) E-Learning Platform
