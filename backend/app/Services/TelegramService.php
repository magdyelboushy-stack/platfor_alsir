<?php

namespace App\Services;

class TelegramService {
    private static function getBotToken() {
        return $_ENV['TELEGRAM_BOT_TOKEN'] ?? null;
    }

    private static function getAdminChatId() {
        return $_ENV['TELEGRAM_ADMIN_CHAT_ID'] ?? null;
    }

    /**
     * Send a message to the admin chat
     */
    public static function sendMessage($text, $replyMarkup = null) {
        $token = self::getBotToken();
        $chatId = self::getAdminChatId();

        if (!$token || !$chatId) {
            error_log("Telegram Error: Token or Admin Chat ID missing.");
            return false;
        }

        $url = "https://api.telegram.org/bot$token/sendMessage";
        
        $data = [
            'chat_id' => $chatId,
            'text' => $text,
            'parse_mode' => 'HTML'
        ];

        if ($replyMarkup) {
            $data['reply_markup'] = json_encode($replyMarkup);
        }

        return self::makeRequest($url, $data);
    }

    /**
     * Send a photo to the admin chat with caption
     */
    public static function sendPhoto($photoPath, $caption, $replyMarkup = null) {
        $token = self::getBotToken();
        $chatId = self::getAdminChatId();

        if (!$token || !$chatId) {
            error_log("Telegram Error: Token or Admin Chat ID missing.");
            return false;
        }

        $url = "https://api.telegram.org/bot$token/sendPhoto";

        // Determine if photo is a URL or a local path
        if (strpos($photoPath, 'http') === 0) {
            $photo = $photoPath;
            $data = [
                'chat_id' => $chatId,
                'photo' => $photo,
                'caption' => $caption,
                'parse_mode' => 'HTML'
            ];
        } else {
            // Local file - use CURLFile
            $fullPath = realpath($photoPath);
            if (!$fullPath) {
                // Try relative to storage dir (common structure)
                $fullPath = realpath(__DIR__ . '/../../storage/' . $photoPath);
            }
            if (!$fullPath) {
                // Try relative to public dir
                $fullPath = realpath(__DIR__ . '/../../public/' . $photoPath);
            }
            
            if (!$fullPath || !file_exists($fullPath)) {
                error_log("Telegram Error: Photo not found at $photoPath (Resolved to: " . ($fullPath ?: 'null') . ")");
                return self::sendMessage($caption, $replyMarkup); // Fallback to text
            }

            $data = [
                'chat_id' => $chatId,
                'photo' => new \CURLFile($fullPath),
                'caption' => $caption,
                'parse_mode' => 'HTML'
            ];
        }

        if ($replyMarkup) {
            $data['reply_markup'] = json_encode($replyMarkup);
        }

        return self::makeRequest($url, $data, true); // true for multipart
    }

    /**
     * Notify about a new student registration with all details
     */
    public static function notifyNewStudent($student) {
        $text = "🔔 <b>طالب جديد سجل في المنصة!</b>\n";
        $text .= "────────────────\n";
        $text .= "👤 <b>الاسم:</b> {$student['name']}\n";
        $text .= "📞 <b>الهاتف:</b> <code>{$student['phone']}</code>\n";
        $text .= "📧 <b>البريد:</b> {$student['email']}\n";
        $text .= "⚧ <b>النوع:</b> " . ($student['gender'] == 'male' ? 'ذكر' : 'أنثى') . "\n";
        $text .= "🎂 <b>الميلاد:</b> " . ($student['birth_date'] ?? 'غير محدد') . "\n";
        $text .= "────────────────\n";
        
        // Stage mapping
        $stagesMap = [
            'primary' => 'الابتدائية 🎒',
            'prep' => 'الإعدادية 🎓',
            'secondary' => 'الثانوية 🏛️'
        ];
        $stageLabel = $stagesMap[$student['education_stage']] ?? $student['education_stage'];

        // Grade mapping
        $gradesMap = [
            '1' => 'الأول الابتدائي', '2' => 'الثاني الابتدائي', '3' => 'الثالث الابتدائي',
            '4' => 'الرابع الابتدائي', '5' => 'الخامس الابتدائي', '6' => 'السادس الابتدائي',
            '7' => 'الأول الإعدادي', '8' => 'الثاني الإعدادي', '9' => 'الثالث الإعدادي',
            '10' => 'الأول الثانوي', '11' => 'الثاني الثانوي', '12' => 'الثالث الثانوي'
        ];
        $gradeLabel = $gradesMap[$student['grade_level']] ?? ($student['grade_level'] ?? 'غير محدد');

        $text .= "📚 <b>البيانات الدراسية:</b>\n";
        $text .= "🎓 <b>المرحلة:</b> {$stageLabel}\n";
        $text .= "📊 <b>الصف:</b> {$gradeLabel}\n";
        $text .= "🏫 <b>المدرسة:</b> " . ($student['school_name'] ?? 'غير محدد') . "\n";
        $text .= "📍 <b>العنوان:</b> {$student['governorate']} - {$student['city']}\n";
        $text .= "────────────────\n";

        $text .= "👨‍👩‍👧 <b>ولي الأمر:</b>\n";
        $text .= "🏷️ <b>الاسم:</b> " . ($student['guardian_name'] ?? 'غير محدد') . "\n";
        $text .= "📞 <b>الهاتف:</b> <code>" . ($student['parent_phone'] ?? 'غير محدد') . "</code>\n";
        $text .= "────────────────\n";

        $text .= "🕒 <b>التوقيت:</b> " . date('Y-m-d H:i') . "\n";

        $replyMarkup = [
            'inline_keyboard' => [
                [
                    ['text' => '✅ قبول الطالب', 'callback_data' => "approve_{$student['id']}"],
                    ['text' => '❌ رفض وحذف', 'callback_data' => "reject_{$student['id']}"]
                ]
            ]
        ];

        if (!empty($student['avatar'])) {
            return self::sendPhoto($student['avatar'], $text, $replyMarkup);
        }

        return self::sendMessage($text, $replyMarkup);
    }

    /**
     * Notify admin chat about a new contact message
     */
    public static function notifyContactMessage(string $id, string $name, string $email, ?string $phone, string $message) {
        $safeName = htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $safeEmail = htmlspecialchars($email, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $safePhone = $phone ? htmlspecialchars($phone, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') : 'غير مذكور';
        $safeMsg = htmlspecialchars($message, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

        $text = "📬 <b>رسالة تواصل جديدة</b>\n";
        $text .= "────────────────\n";
        $text .= "👤 <b>الاسم:</b> {$safeName}\n";
        $text .= "📧 <b>البريد:</b> {$safeEmail}\n";
        $text .= "📞 <b>الهاتف:</b> <code>{$safePhone}</code>\n";
        $text .= "────────────────\n";
        $text .= "📝 <b>الرسالة:</b>\n";
        $text .= $safeMsg . "\n";
        $text .= "────────────────\n";
        $text .= "🆔 <b>ID:</b> <code>{$id}</code>\n";

        $replyMarkup = [
            'inline_keyboard' => [
                [
                    ['text' => '✍️ رد عبر البوت', 'callback_data' => "contact_reply:{$id}"],
                ],
                [
                    ['text' => '✅ تعليم أُرسلت', 'callback_data' => "contact_status:{$id}:sent"],
                    ['text' => '❌ تعليم فشل', 'callback_data' => "contact_status:{$id}:failed"],
                    ['text' => '📨 تم الرد', 'callback_data' => "contact_status:{$id}:responded"],
                ],
            ],
        ];

        return self::sendMessage($text, $replyMarkup);
    }

    /**
     * Answer Callback Query
     */
    public static function answerCallback($callbackQueryId, $text) {
        $token = self::getBotToken();
        $url = "https://api.telegram.org/bot$token/answerCallbackQuery";
        
        $data = [
            'callback_query_id' => $callbackQueryId,
            'text' => $text,
            'show_alert' => true
        ];

        return self::makeRequest($url, $data);
    }

    /**
     * Edit Message Text (to update the message after action)
     */
    public static function editMessage($messageId, $newText) {
        $token = self::getBotToken();
        $chatId = self::getAdminChatId();
        $url = "https://api.telegram.org/bot$token/editMessageText";
        
        $data = [
            'chat_id' => $chatId,
            'message_id' => $messageId,
            'text' => $newText,
            'parse_mode' => 'HTML'
        ];

        return self::makeRequest($url, $data);
    }

    private static function makeRequest($url, $data, $multipart = false) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 1);
        
        if ($multipart) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        } else {
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        }

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // For local dev
        
        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            error_log("Telegram CURL Error: $error");
            return ['ok' => false, 'description' => $error];
        }

        return json_decode($response, true);
    }
}
