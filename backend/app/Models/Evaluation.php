<?php

namespace App\Models;

use App\Core\Model;

class Evaluation extends Model {
    protected $table = 'evaluations';

    /**
     * Get evaluations with their files
     */
    public function getAllWithFiles($filters = []) {
        $sql = "SELECT e.*, GROUP_CONCAT(
                    CONCAT(ef.file_path, ':', ef.file_type) 
                    SEPARATOR '|'
                ) as files_data
                FROM evaluations e
                LEFT JOIN evaluation_files ef ON e.id = ef.evaluation_id";

        $where = [];
        $params = [];

        if (!empty($filters['education_stage'])) {
            $where[] = "e.education_stage = :education_stage";
            $params['education_stage'] = $filters['education_stage'];
        }

        if (!empty($filters['grade_level'])) {
            $where[] = "e.grade_level = :grade_level";
            $params['grade_level'] = $filters['grade_level'];
        }

        if (!empty($filters['subject'])) {
            $where[] = "e.subject = :subject";
            $params['subject'] = $filters['subject'];
        }

        if (!empty($filters['resource_type'])) {
            $where[] = "e.resource_type = :resource_type";
            $params['resource_type'] = $filters['resource_type'];
        }

        if (!empty($where)) {
            $sql .= " WHERE " . implode(" AND ", $where);
        }

        $sql .= " GROUP BY e.id ORDER BY e.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $results = $stmt->fetchAll();

        // Process files_data into array
        foreach ($results as &$row) {
            $files = [];
            if (!empty($row['files_data'])) {
                $fileItems = explode('|', $row['files_data']);
                foreach ($fileItems as $item) {
                    list($path, $type) = explode(':', $item);
                    $files[] = [
                        'file_path' => $path,
                        'file_type' => $type,
                        'url' => $this->getFileUrl($path)
                    ];
                }
            }
            $row['files'] = $files;
            unset($row['files_data']);
        }

        return $results;
    }

    public function incrementDownloads($id) {
        $stmt = $this->db->prepare("UPDATE {$this->table} SET downloads_count = downloads_count + 1 WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    private function getFileUrl($path) {
        $baseUrl = $_ENV['APP_URL'] ?? '';
        return rtrim($baseUrl, '/') . '/' . ltrim($path, '/');
    }
}
