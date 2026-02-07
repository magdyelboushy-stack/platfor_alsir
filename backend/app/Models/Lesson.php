<?php

namespace App\Models;

use App\Core\Model;

class Lesson extends Model {
    protected $table = 'lessons';

    protected $fillable = [
        'section_id', 'title', 'content_type', 'content_url',
        'duration_minutes', 'is_preview', 'sort_order', 'description'
    ];

    /**
     * Create a new lesson
     */
    public function create($data) {
        $filteredData = array_intersect_key($data, array_flip($this->fillable));
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

        $stmt = $this->db->prepare($sql);
        $stmt->execute($filteredData);
        return $filteredData['id'];
    }

    /**
     * Get lessons by section ID
     */
    public function getBySection($sectionId) {
        $stmt = $this->db->prepare(
            "SELECT * FROM {$this->table} WHERE section_id = :section_id ORDER BY sort_order ASC"
        );
        $stmt->execute(['section_id' => $sectionId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get lessons by course ID (through sections)
     */
    public function getByCourse($courseId) {
        $stmt = $this->db->prepare(
            "SELECT l.*, s.title as section_title 
             FROM {$this->table} l 
             JOIN course_sections s ON l.section_id = s.id 
             WHERE s.course_id = :course_id 
             ORDER BY s.sort_order ASC, l.sort_order ASC"
        );
        $stmt->execute(['course_id' => $courseId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Update sort orders for multiple lessons
     */
    public function updateSortOrders($lessons) {
        $stmt = $this->db->prepare(
            "UPDATE {$this->table} SET sort_order = :order WHERE id = :id"
        );

        foreach ($lessons as $index => $lessonId) {
            $stmt->execute(['order' => $index, 'id' => $lessonId]);
        }

        return true;
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
}
