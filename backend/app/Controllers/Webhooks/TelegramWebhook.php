<?php

namespace App\Controllers\Webhooks;

use App\Core\BaseController;
use App\Models\User;
use App\Services\TelegramService;
use App\Services\EmailService;
use App\Utils\AuditLogger;

// Load Debug Logger
require_once __DIR__ . '/../../../DebugLogger.php';

class TelegramWebhook extends BaseController {
    protected $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    public function handle() {
        $input = file_get_contents('php://input');
        \DebugLogger::log("TELEGRAM_WEBHOOK: Received Request", ['input_length' => strlen($input)]);
        
        $update = json_decode($input, true);

        if (!$update) {
            \DebugLogger::log("TELEGRAM_WEBHOOK: Failed to decode JSON or empty body", ['input' => $input]);
            return;
        }
        
        \DebugLogger::log("TELEGRAM_WEBHOOK: Update Type", ['keys' => array_keys($update)]);

        // Callback queries (button clicks)
        if (isset($update['callback_query'])) {
            $this->handleCallback($update['callback_query']);
            return;
        }

        // Plain messages (used for replying to contact via bot)
        if (isset($update['message'])) {
            $this->handleIncomingMessage($update['message']);
            return;
        }
    }

    private function handleCallback($callback) {
        $id = $callback['id'];
        $data = $callback['data'];
        $message = $callback['message'];
        $messageId = $message['message_id'];
        $fromId = $callback['from']['id']; // User who clicked the button
        $firstName = $callback['from']['first_name'] ?? 'Admin';

        // Security: Check if sender is authorized (Admin or Assistant)
        // ideally compare with a list of authorized IDs or rely on group privacy
        
        if (strpos($data, 'approve_') === 0) {
            $studentId = substr($data, 8);
            $this->approveStudent($id, $messageId, $studentId, $firstName);
        } elseif (strpos($data, 'reject_') === 0) {
            $studentId = substr($data, 7);
            $this->rejectStudent($id, $messageId, $studentId, $firstName);
        } elseif (strpos($data, 'contact_reply:') === 0) {
            $contactId = substr($data, strlen('contact_reply:'));
            $this->startContactReply($id, $messageId, $contactId, $fromId, $firstName);
        } elseif (strpos($data, 'contact_status:') === 0) {
            // Format: contact_status:<id>:<status>
            $parts = explode(':', $data);
            $contactId = $parts[1] ?? null;
            $status = $parts[2] ?? null;
            if ($contactId && $status) {
                $this->updateContactStatus($id, $messageId, $contactId, $status, $firstName);
            } else {
                TelegramService::answerCallback($id, "⚠️ بيانات العملية غير صالحة");
            }
        }
    }

    private function approveStudent($callbackId, $messageId, $studentId, $adminName) {
        \DebugLogger::log("TELEGRAM_WEBHOOK: Starting approval", ['studentId' => $studentId, 'admin' => $adminName]);
        
        try {
            $target = $this->userModel->find($studentId);
            \DebugLogger::log("TELEGRAM_WEBHOOK: User lookup", ['found' => $target ? 'Yes - '.$target['name'] : 'NO']);
            
            if (!$target) {
                TelegramService::answerCallback($callbackId, "❌ هذا الطالب لم يعد موجوداً في النظام");
                return;
            }

            \DebugLogger::log("TELEGRAM_WEBHOOK: Current status", ['status' => $target['status']]);
            
            if ($target['status'] === 'active') {
                TelegramService::answerCallback($callbackId, "⚠️ تم تفعيل هذا الحساب مسبقاً");
                return;
            }

            // 1. Generate Code and Activate
            $verificationCode = EmailService::generateCode();
            \DebugLogger::log("TELEGRAM_WEBHOOK: Generated code", ['code' => $verificationCode]);
            
            $updateData = [
                'status' => 'active',
                'sms_code' => $verificationCode,
                'is_sms_verified' => 0
            ];

            \DebugLogger::log("TELEGRAM_WEBHOOK: Attempting update...");
            $updateResult = $this->userModel->update($studentId, $updateData);
            \DebugLogger::log("TELEGRAM_WEBHOOK: Update result", ['success' => $updateResult ? 'YES' : 'NO']);

            if ($updateResult) {
                // 2. Send Email
                \DebugLogger::log("TELEGRAM_WEBHOOK: Sending email", ['to' => $target['email']]);
                EmailService::sendVerificationCode($target['email'], $target['name'], $verificationCode);

                // 3. Update Telegram Message (Premium Design)
                $newText = "🎉 <b>تم قبول الطالب بنجاح!</b>\n";
                $newText .= "────────────────\n";
                $newText .= "👤 <b>الاسم:</b> {$target['name']}\n";
                $newText .= "📧 <b>البريد:</b> {$target['email']}\n";
                $newText .= "📞 <b>الهاتف:</b> <code>{$target['phone']}</code>\n";
                $newText .= "────────────────\n";
                $newText .= "🔑 <b>كود التفعيل:</b> <code>$verificationCode</code>\n";
                $newText .= "👨‍💻 <b>بواسطة:</b> $adminName\n";
                $newText .= "✅ <b>الحالة:</b> نشط الآن\n";
                $newText .= "🚀 <i>تم إرسال بريد التفعيل للطالب</i>";

                TelegramService::editMessage($messageId, $newText);
                
                // 4. Send Audit Log
                AuditLogger::log(0, 'telegram_approve', 'users', $studentId, "Approved via Telegram by $adminName");
                
                // 5. Toast Notification
                TelegramService::answerCallback($callbackId, "✅ تم تفعيل الطالب وإرسال الإيميل بنجاح!");
            } else {
                \DebugLogger::log("TELEGRAM_WEBHOOK: Update FAILED!");
                TelegramService::answerCallback($callbackId, "❌ فشل تحديث بيانات الطالب");
            }
        } catch (\Exception $e) {
            \DebugLogger::log("TELEGRAM_WEBHOOK ERROR", ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            TelegramService::answerCallback($callbackId, "❌ حدث خطأ أثناء المعالجة");
        }
    }

    private function rejectStudent($callbackId, $messageId, $studentId, $adminName) {
        try {
            $target = $this->userModel->find($studentId);
            if (!$target) {
                TelegramService::answerCallback($callbackId, "❌ هذا الطالب لم يعد موجوداً");
                return;
            }

            // Hard Delete
            if ($this->userModel->delete($studentId)) {
                // Update Telegram Message
                $newText = "🚫 <b>تم رفض طلب التسجيل</b>\n";
                $newText .= "────────────────\n";
                $newText .= "👤 <b>الاسم:</b> <del>{$target['name']}</del>\n";
                $newText .= "📞 <b>الهاتف:</b> <del>{$target['phone']}</del>\n";
                $newText .= "────────────────\n";
                $newText .= "👮‍♂️ <b>بواسطة:</b> $adminName\n";
                $newText .= "🗑️ <b>الإجراء:</b> تم حذف البيانات نهائياً\n";

                TelegramService::editMessage($messageId, $newText);
                
                AuditLogger::log(0, 'telegram_reject', 'users', $studentId, "Rejected via Telegram by $adminName");
                
                TelegramService::answerCallback($callbackId, "🗑️ تم رفض وحذف الطالب بنجاح");
            }
        } catch (\Exception $e) {
            error_log("Webhook Error: " . $e->getMessage());
            TelegramService::answerCallback($callbackId, "❌ حدث خطأ أثناء المعالجة");
        }
    }

    /**
     * Set bot to expect next message as reply to a contact
     */
    private function startContactReply($callbackId, $messageId, $contactId, $chatId, $adminName) {
        try {
            $db = \App\Config\Database::getInstance()->getConnection();
            $stmt = $db->prepare("UPDATE contact_messages SET pending_reply_chat_id = :chat WHERE id = :id");
            $stmt->execute(['chat' => (string)$chatId, 'id' => $contactId]);

            $newText = "✍️ <b>الرد عبر البوت</b>\n";
            $newText .= "────────────────\n";
            $newText .= "🔗 <b>الرسالة:</b> <code>{$contactId}</code>\n";
            $newText .= "👨‍💻 <b>بواسطة:</b> {$adminName}\n";
            $newText .= "📨 <i>اكتب الرد الآن وسيتم إرساله للعميل عبر البريد</i>";

            TelegramService::editMessage($messageId, $newText);
            TelegramService::answerCallback($callbackId, "✍️ اكتب الرد وسيتم إرساله للبريد");
        } catch (\Exception $e) {
            TelegramService::answerCallback($callbackId, "❌ حدث خطأ أثناء التهيئة للرد");
        }
    }

    /**
     * Update contact message status from bot buttons
     */
    private function updateContactStatus($callbackId, $messageId, $contactId, $status, $adminName) {
        $allowed = ['new','sent','failed','responded'];
        if (!in_array($status, $allowed)) {
            TelegramService::answerCallback($callbackId, "⚠️ حالة غير مدعومة");
            return;
        }
        try {
            $db = \App\Config\Database::getInstance()->getConnection();
            $stmt = $db->prepare("UPDATE contact_messages SET status = :status WHERE id = :id");
            $stmt->execute(['status' => $status, 'id' => $contactId]);

            $newText = "📬 <b>رسالة تواصل</b>\n";
            $newText .= "────────────────\n";
            $newText .= "🆔 <b>ID:</b> <code>{$contactId}</code>\n";
            $newText .= "👨‍💻 <b>أُجريت بواسطة:</b> {$adminName}\n";
            $newText .= "✅ <b>الحالة:</b> {$status}\n";

            TelegramService::editMessage($messageId, $newText);
            TelegramService::answerCallback($callbackId, "✅ تم تحديث الحالة إلى {$status}");
        } catch (\Exception $e) {
            TelegramService::answerCallback($callbackId, "❌ فشل تحديث الحالة");
        }
    }

    /**
     * Handle plain text message: if there's a pending contact reply for this chat,
     * send email to the contact and mark responded.
     */
    private function handleIncomingMessage($message) {
        $chatId = $message['chat']['id'] ?? null;
        $text = trim($message['text'] ?? '');
        if (!$chatId || $text === '') {
            return;
        }
        try {
            $db = \App\Config\Database::getInstance()->getConnection();
            $get = $db->prepare("SELECT id, email, name FROM contact_messages WHERE pending_reply_chat_id = :chat LIMIT 1");
            $get->execute(['chat' => (string)$chatId]);
            $row = $get->fetch(\PDO::FETCH_ASSOC);
            if (!$row) {
                return;
            }
            $id = $row['id'];
            $toEmail = $row['email'];
            $toName = $row['name'];

            $ok = EmailService::sendContactReply($toEmail, $toName, $text);
            $upd = $db->prepare("UPDATE contact_messages SET status = 'responded', admin_reply = :reply, replied_at = CURRENT_TIMESTAMP, pending_reply_chat_id = NULL WHERE id = :id");
            $upd->execute(['reply' => $text, 'id' => $id]);

            // Confirm to admin
            TelegramService::sendMessage("✅ تم إرسال الرد إلى {$toName} <code>{$toEmail}</code>\n🆔 <code>{$id}</code>");
        } catch (\Exception $e) {
            TelegramService::sendMessage("❌ فشل إرسال الرد عبر البريد");
        }
    }

    /**
     * Setup Webhook URL (One-time use)
     */
    public function setup() {
        $token = $_ENV['TELEGRAM_BOT_TOKEN'] ?? '';
        $domain = $_ENV['APP_URL'] ?? 'https://bistunhalk.alwaysdata.net'; 
        $webhookUrl = $domain . '/api/webhooks/telegram';

        if (!$token) {
            $this->json(['error' => 'TELEGRAM_BOT_TOKEN is missing'], 500);
        }

        // 1. Get current info
        $info = @file_get_contents("https://api.telegram.org/bot$token/getWebhookInfo");
        
        // 2. Set new webhook
        $url = "https://api.telegram.org/bot$token/setWebhook?url=" . urlencode($webhookUrl);
        $result = @file_get_contents($url);
        
        if ($result === false) {
             $this->json(['error' => 'Failed to connect to Telegram API'], 500);
        }

        $response = json_decode($result, true);

        if (($response['ok'] ?? false)) {
            $this->json([
                'message' => 'Webhook Updated Successfully',
                'webhook_url' => $webhookUrl,
                'telegram_response' => $response,
                'current_info' => json_decode($info, true)
            ]);
        } else {
            $this->json([
                'error' => 'Failed to update Webhook',
                'telegram_response' => $response
            ], 500);
        }
    }
}
