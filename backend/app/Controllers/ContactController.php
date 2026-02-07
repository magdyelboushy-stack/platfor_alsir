<?php

namespace App\Controllers;

use App\Core\BaseController;
use App\Config\Database;
use App\Services\EmailService;
use App\Utils\SecureSession;
use App\Services\SmsService;
use App\Services\TelegramService;

class ContactController extends BaseController {
    private function ensureTableExists($db) {
        $db->exec("CREATE TABLE IF NOT EXISTS contact_messages (
            id VARCHAR(36) NOT NULL,
            name VARCHAR(100) NOT NULL,
            phone VARCHAR(20) DEFAULT NULL,
            message TEXT NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'new',
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            email VARCHAR(150) DEFAULT NULL,
            admin_reply TEXT NULL,
            replied_at TIMESTAMP NULL DEFAULT NULL,
            telegram_message_id VARCHAR(30) DEFAULT NULL,
            telegram_chat_id VARCHAR(30) DEFAULT NULL,
            pending_reply_chat_id VARCHAR(30) DEFAULT NULL,
            PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        try { $db->exec("ALTER TABLE contact_messages MODIFY COLUMN phone VARCHAR(20) NULL"); } catch (\Throwable $e) {}
        try { $db->exec("ALTER TABLE contact_messages ADD COLUMN admin_reply TEXT"); } catch (\Throwable $e) {}
        try { $db->exec("ALTER TABLE contact_messages ADD COLUMN replied_at TIMESTAMP NULL DEFAULT NULL"); } catch (\Throwable $e) {}
        try { $db->exec("ALTER TABLE contact_messages ADD COLUMN telegram_message_id VARCHAR(30) DEFAULT NULL"); } catch (\Throwable $e) {}
        try { $db->exec("ALTER TABLE contact_messages ADD COLUMN telegram_chat_id VARCHAR(30) DEFAULT NULL"); } catch (\Throwable $e) {}
        try { $db->exec("ALTER TABLE contact_messages ADD COLUMN pending_reply_chat_id VARCHAR(30) DEFAULT NULL"); } catch (\Throwable $e) {}
    }

    public function handle() {
        SecureSession::start();

        $data = $this->getInput();
        $csrf = $data['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
        $isLocal = ($_ENV['APP_ENV'] ?? 'production') === 'local';
        if (!$isLocal && !\App\Utils\CSRF::validate($csrf)) {
            $this->json(['error' => 'فشل التحقق الأمني، يرجى تحديث الصفحة والمحاولة مرة أخرى.'], 403);
        }

        $name = trim($data['name'] ?? '');
        $email = trim($data['email'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $message = trim($data['message'] ?? '');

        if (mb_strlen($name) < 3) {
            $this->json(['error' => 'يرجى إدخال الاسم بالكامل بشكل صحيح'], 422);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->json(['error' => 'يرجى إدخال بريد إلكتروني صالح'], 422);
        }
        if ($phone && !preg_match('/^0\d{10}$/', $phone)) {
            $this->json(['error' => 'يرجى إدخال رقم موبايل صحيح مكون من 11 رقم ويبدأ بـ 0 أو اتركه فارغاً'], 422);
        }
        if (mb_strlen($message) < 10) {
            $this->json(['error' => 'نص الرسالة قصير جداً، يرجى التوضيح أكثر'], 422);
        }

        $db = Database::getInstance()->getConnection();
        $this->ensureTableExists($db);
        $id = $this->generateUuid();
        try {
            $stmt = $db->prepare("INSERT INTO contact_messages (id, name, email, phone, message, status) VALUES (?, ?, ?, ?, ?, 'new')");
            $stmt->execute([$id, $name, $email, $phone ?: null, $message]);
        } catch (\Throwable $e) {
            $this->json(['error' => 'تعذر حفظ الرسالة حالياً'], 500);
        }
        $contactEmail = null;
        try {
            $stmt = $db->prepare("SELECT `value` FROM system_settings WHERE `key` = 'contact_email'");
            $stmt->execute();
            $contactEmail = $stmt->fetchColumn() ?: null;
        } catch (\Throwable $e) {
            // ignore and fallback
        }
        if (!$contactEmail) {
            $contactEmail = $_ENV['MAIL_FROM_ADDRESS'] ?? null;
        }
        if (!$contactEmail) {
            $this->json(['error' => 'تعذر تحديد البريد المستلم. يرجى ضبط contact_email من إعدادات النظام.'], 500);
        }

        $sent = EmailService::sendContactAdminNotification($contactEmail, $name, $email, $phone, $message);
        if (!$sent) {
            try {
                $upd = $db->prepare("UPDATE contact_messages SET status = 'failed' WHERE id = ?");
                $upd->execute([$id]);
            } catch (\Throwable $e) {}
            $this->json(['error' => 'تعذر إرسال الرسالة حالياً. يرجى المحاولة لاحقاً.'], 500);
        }
        try {
            $upd = $db->prepare("UPDATE contact_messages SET status = 'sent' WHERE id = ?");
            $upd->execute([$id]);
        } catch (\Throwable $e) {}

        // Notify Admin via Telegram
        try {
            $tg = TelegramService::notifyContactMessage($id, $name, $email, $phone ?: null, $message);
            if (is_array($tg) && ($tg['ok'] ?? false)) {
                $chatId = $tg['result']['chat']['id'] ?? null;
                $msgId = $tg['result']['message_id'] ?? null;
                if ($chatId && $msgId) {
                    $updTg = $db->prepare("UPDATE contact_messages SET telegram_chat_id = :chat, telegram_message_id = :msg WHERE id = :id");
                    $updTg->execute(['chat' => (string)$chatId, 'msg' => (string)$msgId, 'id' => $id]);
                }
            }
        } catch (\Throwable $e) {
            // ignore telegram errors
        }

        // Auto-reply to sender confirming receipt
        @EmailService::sendContactUserConfirmation($email, $name, $message);

        $this->json(['success' => true, 'message' => 'تم إرسال الرسالة بنجاح! سنقوم بالرد عليك قريباً.']);
    }

    public function info() {
        $this->json(['message' => 'استخدم POST /api/contact لإرسال الرسائل']);
    }

    public function list() {
        SecureSession::start();
        $role = SecureSession::get('role');
        if ($role !== 'admin') {
            $this->json(['error' => 'غير مصرح'], 403);
        }
        $db = Database::getInstance()->getConnection();
        $this->ensureTableExists($db);
        $stmt = $db->query("SELECT id, name, email, phone, message, status, created_at, admin_reply, replied_at FROM contact_messages ORDER BY created_at DESC");
        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        $this->json($rows);
    }

    public function updateStatus($params) {
        SecureSession::start();
        $role = SecureSession::get('role');
        if ($role !== 'admin') {
            $this->json(['error' => 'غير مصرح'], 403);
        }
        $data = $this->getInput();
        $csrf = $data['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
        $isLocal = ($_ENV['APP_ENV'] ?? 'production') === 'local';
        if (!$isLocal && !\App\Utils\CSRF::validate($csrf)) {
            $this->json(['error' => 'فشل التحقق الأمني'], 403);
        }
        $id = $params['id'] ?? null;
        $status = $data['status'] ?? '';
        $allowed = ['new','sent','failed','responded'];
        if (!$id || !in_array($status, $allowed)) {
            $this->json(['error' => 'بيانات غير صالحة'], 422);
        }
        $db = Database::getInstance()->getConnection();
        $this->ensureTableExists($db);
        $stmt = $db->prepare("UPDATE contact_messages SET status = :status WHERE id = :id");
        $stmt->execute(['status' => $status, 'id' => $id]);
        $row = $db->prepare("SELECT id, name, phone, message, status, created_at FROM contact_messages WHERE id = ?");
        $row->execute([$id]);
        $this->json(['updated' => $row->fetch(\PDO::FETCH_ASSOC)]);
    }

    public function reply($params) {
        SecureSession::start();
        $role = SecureSession::get('role');
        if ($role !== 'admin') {
            $this->json(['error' => 'غير مصرح'], 403);
        }
        $data = $this->getInput();
        $csrf = $data['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
        $isLocal = ($_ENV['APP_ENV'] ?? 'production') === 'local';
        if (!$isLocal && !\App\Utils\CSRF::validate($csrf)) {
            $this->json(['error' => 'فشل التحقق الأمني'], 403);
        }
        $id = $params['id'] ?? null;
        $reply = trim($data['reply'] ?? '');
        if (!$id || mb_strlen($reply) < 3) {
            $this->json(['error' => 'يرجى كتابة رد مناسب'], 422);
        }
        $db = Database::getInstance()->getConnection();
        $this->ensureTableExists($db);
        $get = $db->prepare("SELECT email, name FROM contact_messages WHERE id = ?");
        $get->execute([$id]);
        $row = $get->fetch(\PDO::FETCH_ASSOC);
        $toEmail = $row['email'] ?? null;
        $toName = $row['name'] ?? 'صاحب الاستفسار';
        if (!$toEmail || !filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
            $this->json(['error' => 'البريد الإلكتروني غير صالح للرد'], 422);
        }
        $ok = EmailService::sendContactReply($toEmail, $toName, $reply);
        $stmt = $db->prepare("UPDATE contact_messages SET status = 'responded', admin_reply = :reply, replied_at = CURRENT_TIMESTAMP WHERE id = :id");
        $stmt->execute(['reply' => $reply, 'id' => $id]);
        $this->json(['sent' => $ok, 'message' => 'تم إرسال الرد عبر البريد وتحديث الحالة']);
    }
}
