<?php

namespace App\Models;

use App\Core\Model;

class Section extends Model {
    protected $table = 'course_sections';

    protected $fillable = ['course_id', 'title', 'sort_order'];

    /**
     * Create a new section
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
     * Get sections by course ID
     */
    public function getByCourse($courseId) {
        $stmt = $this->db->prepare(
            "SELECT * FROM {$this->table} WHERE course_id = :course_id ORDER BY sort_order ASC"
        );
        $stmt->execute(['course_id' => $courseId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get section with lessons
     */
    public function getWithLessons($sectionId) {
        $section = $this->find($sectionId);
        if (!$section) return null;

        $stmt = $this->db->prepare(
            "SELECT * FROM lessons WHERE section_id = :id ORDER BY sort_order ASC"
        );
        $stmt->execute(['id' => $sectionId]);
        $section['lessons'] = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        return $section;
    }

    /**
     * Update sort orders for multiple sections
     */
    public function updateSortOrders($sections) {
        $stmt = $this->db->prepare(
            "UPDATE {$this->table} SET sort_order = :order WHERE id = :id"
        );

        foreach ($sections as $index => $sectionId) {
            $stmt->execute(['order' => $index, 'id' => $sectionId]);
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
