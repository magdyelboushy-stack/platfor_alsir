<?php

namespace App\Controllers\Admin;

use App\Core\BaseController;
use App\Utils\SecureSession;
use PDO;

class ActivityLogsController extends BaseController {
    
    protected $db;

    public function __construct() {
        $this->db = \App\Config\Database::getInstance()->getConnection();
    }
    
    /**
     * Get Activities Log
     * GET /api/admin/logs
     */
    public function index() {
        // 1. Auth Check
        if (SecureSession::get('role') !== 'admin') {
            $this->json(['error' => 'Unauthorized'], 403);
        }

        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = 20;
        $offset = ($page - 1) * $limit;
        $search = $_GET['search'] ?? '';

        try {
            // query to fetch logs with polymorphic join based on JSON role
            // We use MySQL JSON functions to extract role
            
            $sql = "
                SELECT 
                    l.id,
                    l.action,
                    l.table_name,
                    l.created_at,
                    l.new_data,
                    -- Extract Meta
                    JSON_UNQUOTE(JSON_EXTRACT(l.new_data, '$._meta.role')) as actor_role,
                    
                    -- Dynamic Actor Name
                    COALESCE(
                        CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(l.new_data, '$._meta.role')) = 'teacher' THEN t.name END,
                        CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(l.new_data, '$._meta.role')) = 'assistant' THEN a.name END,
                        CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(l.new_data, '$._meta.role')) = 'student' THEN s.name END,
                        u.name -- default/fallback for admin or unspecified
                    ) as actor_name,

                    -- Dynamic Actor Email
                    COALESCE(
                        CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(l.new_data, '$._meta.role')) = 'teacher' THEN t.email END,
                        CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(l.new_data, '$._meta.role')) = 'assistant' THEN a.email END,
                        CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(l.new_data, '$._meta.role')) = 'student' THEN s.email END,
                        u.email
                    ) as actor_email,

                    -- Dynamic Actor Avatar
                    COALESCE(
                       CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(l.new_data, '$._meta.role')) = 'teacher' THEN t.avatar END,
                       CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(l.new_data, '$._meta.role')) = 'student' THEN s.avatar END,
                       u.avatar
                    ) as actor_avatar

                FROM audit_logs l
                -- We LEFT JOIN all potential actor tables
                -- We match on ID. The 'Case' logic above filters the correct one.
                LEFT JOIN users u ON l.user_id = u.id
                LEFT JOIN teachers t ON l.user_id = t.id
                LEFT JOIN assistants a ON l.user_id = a.id
                LEFT JOIN users s ON l.user_id = s.id AND s.role = 'student' -- Just in case student is in users table still? Or separate? 
                -- We'll assume Users/Students are in `users` table for now if not migrated, 
                -- BUT User said `teachers` are separate. `users` logic might be tricky.
                -- Let's rely on the Role check.
                
                ORDER BY l.created_at DESC
                LIMIT :limit OFFSET :offset
            ";

            // Count Query for Pagination
            $countSql = "SELECT COUNT(*) FROM audit_logs";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $total = $this->db->query($countSql)->fetchColumn();
            
            // Post-process logs to clean up JSON and format message
            $formattedLogs = array_map(function($log) {
                // Handle legacy logs where new_data might be null
                $newDataJson = $log['new_data'] ?? '{}';
                $decodedData = json_decode($newDataJson, true);
                $meta = $decodedData['_meta'] ?? [];
                
                // Humanize Action
                $actionMap = [
                    'login' => 'تسجيل دخول',
                    'create' => 'إنشاء سجل',
                    'update' => 'تحديث بيانات',
                    'delete' => 'حذف سجل',
                    'create_course' => 'إنشاء كورس جديد',
                    'update_course' => 'تعديل كورس',
                    'delete_course' => 'حذف كورس',
                ];

                return [
                    'id' => $log['id'],
                    'action' => $log['action'],
                    'action_label' => $actionMap[$log['action']] ?? $log['action'],
                    'target' => $log['table_name'],
                    'actor' => [
                        'name' => $log['actor_name'] ?? 'مستخدم غير معروف',
                        'email' => $log['actor_email'],
                        'role' => $log['actor_role'] ?? 'user',
                        'avatar' => $log['actor_avatar']
                    ],
                    'meta' => $meta,
                    'created_at' => $log['created_at']
                ];
            }, $logs);

            $this->json([
                'data' => $formattedLogs,
                'meta' => [
                    'current_page' => $page,
                    'last_page' => ceil($total / $limit),
                    'total' => $total
                ]
            ]);

        } catch (\Exception $e) {
            error_log("Activity Logs Error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في جلب السجلات'], 500);
        }
    }
}
