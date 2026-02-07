<?php

namespace App\Utils;

/**
 * Email Verification System
 */
class EmailVerification {
    
    /**
     * Send Verification Email
     */
    public static function sendVerificationEmail($email, $token, $userName) {
        $appUrl = $_ENV['APP_URL'] ?? 'http://localhost';
        $appName = $_ENV['APP_NAME'] ?? 'Application';
        $verificationLink = $appUrl . "/api/auth/verify-email?token=" . urlencode($token);
        
        $subject = "Verify your account on " . $appName;
        
        $message = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; direction: rtl; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .button { 
                    background-color: #4CAF50; 
                    color: white; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 4px; 
                    display: inline-block;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class='container'>
                <h2>Hello {$userName}</h2>
                <p>Thank you for registering with us!</p>
                <p>Please verify your email by clicking the button below:</p>
                <a href='{$verificationLink}' class='button'>Verify Email</a>
                <p>Or copy the following link:</p>
                <p style='word-break: break-all;'>{$verificationLink}</p>
                <p>This link is valid for 24 hours.</p>
                <hr>
                <p style='color: #666; font-size: 12px;'>
                    If you did not create this account, please ignore this email.
                </p>
            </div>
        </body>
        </html>
        ";
        
        $fromName = $_ENV['MAIL_FROM_NAME'] ?? $appName;
        $fromAddress = $_ENV['MAIL_FROM_ADDRESS'] ?? 'noreply@example.com';

        $headers = [
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . $fromName . ' <' . $fromAddress . '>',
            'X-Mailer: PHP/' . phpversion()
        ];
        
        // In production, use a proper mail library like PHPMailer or SwiftMailer
        return mail($email, $subject, $message, implode("\r\n", $headers));
    }
    
    /**
     * Resend Verification Email
     */
    public static function resendVerification($userId) {
        $db = \App\Config\Database::getInstance()->getConnection();
        
        // Limit to 3 times per hour
        $stmt = $db->prepare("
            SELECT COUNT(*) as count 
            FROM email_verification_log 
            WHERE user_id = :user_id 
            AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
        ");
        $stmt->execute(['user_id' => $userId]);
        $result = $stmt->fetch();
        
        if ($result['count'] >= 3) {
            throw new \Exception("Too many attempts, please try again in an hour");
        }
        
        // Get User
        $stmt = $db->prepare("SELECT email, name, verification_token FROM users WHERE id = :id");
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            throw new \Exception("User not found");
        }
        
        // Generate new token
        $token = bin2hex(random_bytes(32));
        $stmt = $db->prepare("UPDATE users SET verification_token = :token WHERE id = :id");
        $stmt->execute(['token' => $token, 'id' => $userId]);
        
        // Log attempt
        $stmt = $db->prepare("
            INSERT INTO email_verification_log (user_id, created_at) 
            VALUES (:user_id, NOW())
        ");
        $stmt->execute(['user_id' => $userId]);
        
        // Send
        return self::sendVerificationEmail($user['email'], $token, $user['name']);
    }
}
