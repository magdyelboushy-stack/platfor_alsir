<?php

namespace App\Models;

use App\Core\Model;

class Course extends Model {
    protected $table = 'courses';

    protected $fillable = [
        'title', 'description', 'thumbnail', 'intro_video_url', 'price',
        'education_stage', 'grade_level', 'term', 'subject', 'status', 'objectives'
    ];

    /**
     * Create a new course
     */
    public function create($data) {
        $filteredData = array_intersect_key($data, array_flip($this->fillable));
        if (isset($filteredData['price'])) {
            $filteredData['price'] = (float)$filteredData['price'];
        }
        $filteredData['id'] = $this->generateUuid();
        $filteredData['created_at'] = date('Y-m-d H:i:s');

        $fields = array_keys($filteredData);
        $placeholders = array_map(fn($f) => ":$f", $fields);

        $sql = sprintf(
            "INSERT INTO %s (%s) VALUES (%s)",
            $this->table,
            implode(', ', $fields),
            implode(', ', $placeholders)
        );

        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($filteredData);
            return $filteredData['id'];
        } catch (\PDOException $e) {
            error_log("Course creation error: " . $e->getMessage());
            throw new \Exception("فشل إنشاء الكورس");
        }
    }

    /**
     * Get all courses with optional filters
     */
    public function getAll($filters = []) {
        // Single-teacher mode: Admin is the teacher, no teachers table
        $sql = "SELECT c.*, 
                (SELECT name FROM admins LIMIT 1) as teacher_name, 
                (SELECT avatar FROM admins LIMIT 1) as teacher_avatar,
                (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as enrollment_count
                FROM {$this->table} c
                WHERE 1=1";

        $params = [];

        if (!empty($filters['status'])) {
            $sql .= " AND c.status = :status";
            $params['status'] = $filters['status'];
        }

        if (!empty($filters['education_stage'])) {
            $sql .= " AND c.education_stage = :stage";
            $params['stage'] = $filters['education_stage'];
        }

        if (!empty($filters['grade_level'])) {
            if (is_array($filters['grade_level'])) {
                $placeholders = [];
                foreach ($filters['grade_level'] as $i => $val) {
                    $key = "grade_$i";
                    $placeholders[] = ":$key";
                    $params[$key] = $val;
                }
                $sql .= " AND c.grade_level IN (" . implode(', ', $placeholders) . ")";
            } else {
                $sql .= " AND c.grade_level = :grade";
                $params['grade'] = $filters['grade_level'];
            }
        }
        
        // Removed teacher_id filter as column is dropped

        $sql .= " ORDER BY c.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get course with sections and lessons
     */
    public function getWithContent($id) {
        $course = $this->find($id);
        if (!$course) return null;

        // Normalize objectives to array for frontend
        $course['objectives'] = $this->parseObjectives($course['objectives'] ?? null);

        // Get currently logged in user ID if any
        $userId = \App\Utils\SecureSession::get('user_id');

        // Get sections
        $stmt = $this->db->prepare(
            "SELECT * FROM course_sections WHERE course_id = :id ORDER BY sort_order"
        );
        $stmt->execute(['id' => $id]);
        $sections = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Get lessons for each section
        foreach ($sections as &$section) {
            $stmt = $this->db->prepare(
                "SELECT l.*, p.completed as is_completed, p.watched_seconds 
                 FROM lessons l 
                 LEFT JOIN lesson_progress p ON l.id = p.lesson_id AND p.user_id = :uid
                 WHERE l.section_id = :sid 
                 ORDER BY l.sort_order"
            );
            $stmt->execute(['sid' => $section['id'], 'uid' => $userId]);
            $section['lessons'] = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        }

        $course['sections'] = $sections;
        return $course;
    }

    /**
     * Generate UUID
     */
    private function generateUuid() {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    /**
     * Parse objectives from DB (JSON/text) to array
     */
    private function parseObjectives($raw) {
        if (empty($raw)) return [];
        if (is_array($raw)) {
            return array_values(array_filter(array_map('trim', $raw)));
        }
        if (is_string($raw)) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                return array_values(array_filter(array_map('trim', $decoded)));
            }
            $parts = preg_split('/\r?\n|,/', $raw);
            return array_values(array_filter(array_map('trim', $parts)));
        }
        return [];
    }
}
