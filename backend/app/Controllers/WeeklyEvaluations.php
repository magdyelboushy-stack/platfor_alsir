<?php

namespace App\Controllers;

use App\Core\BaseController;
use App\Models\Evaluation;
use App\Models\EvaluationFile;
use App\Utils\FileUploader;
use App\Utils\Authorization;
use App\Config\Database;

class WeeklyEvaluations extends BaseController {
    
    /**
     * Get all evaluations (Public)
     */
    public function index() {
        $evaluationModel = new Evaluation();
        
        $filters = [
            'education_stage' => $_GET['education_stage'] ?? null,
            'grade_level' => $_GET['grade_level'] ?? null,
            'subject' => $_GET['subject'] ?? null,
            'resource_type' => $_GET['resource_type'] ?? null
        ];

        $evaluations = $evaluationModel->getAllWithFiles($filters);
        $this->json($evaluations);
    }

    /**
     * Create new evaluation (Admin Only)
     */
    public function create() {
        // CSRF Check is handled in BaseController or specifically if needed
        // Authorization: Admin check
        if (!Authorization::hasRole(['admin'])) {
            $this->json(['error' => 'غير مصرح لك بالقيام بهذا الإجراء'], 403);
        }

        // CSRF Check
        $data = !empty($_POST) ? $_POST : $this->getInput();
        $csrfToken = $data['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
        if (!\App\Utils\CSRF::validate($csrfToken)) {
            $this->json(['error' => 'فشل التحقق الأمني (CSRF)'], 403);
        }
        
        // Basic validation
        if (empty($data['title']) || empty($data['education_stage']) || empty($data['grade_level'])) {
            $this->json(['error' => 'يرجى ملء جميع الحقول المطلوبة'], 400);
        }

        $evaluationModel = new Evaluation();
        $fileModel = new EvaluationFile();

        try {
            Database::getInstance()->beginTransaction();

            // 1. Create evaluation metadata
            $evaluationId = $evaluationModel->create([
                'title' => $data['title'],
                'description' => $data['description'] ?? '',
                'education_stage' => $data['education_stage'],
                'grade_level' => (int)$data['grade_level'],
                'subject' => $data['subject'] ?? '',
                'resource_type' => $data['resource_type'] ?? 'evaluation'
            ]);

            // 2. Handle file uploads
            if (!empty($_FILES['files'])) {
                $uploader = new FileUploader('evaluations', ['jpg', 'jpeg', 'png', 'pdf'], 5242880); // 5MB limit
                
                $files = $this->reFormatFilesArray($_FILES['files']);
                
                foreach ($files as $file) {
                    $result = $uploader->upload($file);
                    if ($result['success']) {
                        $extension = pathinfo($result['path'], PATHINFO_EXTENSION);
                        $type = in_array(strtolower($extension), ['jpg', 'jpeg', 'png']) ? 'image' : 'pdf';
                        
                        $fileModel->create([
                            'evaluation_id' => $evaluationId,
                            'file_path' => $result['path'],
                            'file_type' => $type
                        ]);
                    } else {
                        // Log upload error but maybe continue? Or fail all?
                        error_log("File upload failed for evaluation: " . $result['error']);
                    }
                }
            }

            Database::getInstance()->commit();
            $this->json(['message' => 'تم إضافة التقييم بنجاح', 'id' => $evaluationId], 201);

        } catch (\Exception $e) {
            Database::getInstance()->rollback();
            error_log("Evaluation creation failed: " . $e->getMessage());
            $this->json(['error' => 'فشل إضافة التقييم', 'message' => 'حدث خطأ غير متوقع'], 500);
        }
    }

    /**
     * Delete evaluation (Admin Only)
     */
    public function delete($params) {
        $id = $params['id'] ?? null;
        if (!Authorization::hasRole(['admin'])) {
            $this->json(['error' => 'غير مصرح لك بالقيام بهذا الإجراء'], 403);
        }

        $evaluationModel = new Evaluation();
        $evaluation = $evaluationModel->find($id);

        if (!$evaluation) {
            $this->json(['error' => 'التقييم غير موجود'], 404);
        }

        // Associated files will be deleted via ON DELETE CASCADE in DB
        // But we should also delete physical files
        $fileModel = new EvaluationFile();
        $stmt = $fileModel->getDb()->prepare("SELECT file_path FROM evaluation_files WHERE evaluation_id = :id");
        $stmt->execute(['id' => $id]);
        $files = $stmt->fetchAll();

        $uploader = new FileUploader('evaluations');
        foreach ($files as $file) {
            $uploader->delete($file['file_path']);
        }

        if ($evaluationModel->delete($id)) {
            $this->json(['message' => 'تم حذف التقييم بنجاح']);
        } else {
            $this->json(['error' => 'فشل حذف التقييم'], 500);
        }
    }

    /**
     * Increment download count
     */
    public function incrementDownload($params) {
        $id = $params['id'] ?? null;
        if (!$id) {
            $this->json(['error' => 'ID مطلوب'], 400);
        }

        $evaluationModel = new Evaluation();
        if ($evaluationModel->incrementDownloads($id)) {
            $this->json(['message' => 'تم التحديث']);
        } else {
            $this->json(['error' => 'فشل التحديث'], 500);
        }
    }

    /**
     * Create or get referral token
     */
    public function createReferral($params) {
        $id = $params['id'] ?? null;
        $data = $this->getInput();
        $uuid = $data['sharer_uuid'] ?? null;

        if (!$id || !$uuid) {
            $this->json(['error' => 'ID and UUID are required'], 400);
        }

        $referralModel = new \App\Models\Referral();
        $referral = $referralModel->getOrCreate($id, $uuid);
        
        $this->json($referral);
    }

    /**
     * Check referral progress
     */
    public function checkReferralStatus($params) {
        $id = $params['id'] ?? null;
        $uuid = $_GET['sharer_uuid'] ?? null;

        if (!$id || !$uuid) {
            $this->json(['error' => 'ID and UUID are required'], 400);
        }

        $referralModel = new \App\Models\Referral();
        $status = $referralModel->checkProgress($id, $uuid);
        
        $this->json($status ?: ['current_count' => 0, 'target_count' => 5]);
    }

    /**
     * Record a visit via referral token
     */
    public function recordReferralVisit($params) {
        $token = $params['token'] ?? null;
        if (!$token) {
            $this->json(['error' => 'Token required'], 400);
        }

        // Handle proxy IPs (like Vercel/Cloudflare)
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'];
        // X-Forwarded-For can contain a list of IPs
        if (strpos($ip, ',') !== false) {
            $ip = trim(explode(',', $ip)[0]);
        }
        
        $referralModel = new \App\Models\Referral();
        
        if ($referralModel->recordVisit($token, $ip)) {
            $this->json(['message' => 'Visit recorded']);
        } else {
            $this->json(['message' => 'Visit already recorded or invalid token']);
        }
    }

    /**
     * Reformat $_FILES array for multi-upload
     */
    private function reFormatFilesArray($files) {
        $file_ary = [];
        $file_count = count($files['name']);
        $file_keys = array_keys($files);

        for ($i = 0; $i < $file_count; $i++) {
            foreach ($file_keys as $key) {
                $file_ary[$i][$key] = $files[$key][$i];
            }
        }

        return $file_ary;
    }
}
