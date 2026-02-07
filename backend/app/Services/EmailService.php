<?php

namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailService {
    
    /**
     * Generate a 6-digit verification code
     */
    public static function generateCode() {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    // Branding - Classical Theme
    private static $logoUrl = 'https://i.ibb.co/chwwR9SZ/594930133-1456894779774091-6490422839217536606-n.jpg';
    private static $bannerUrl = 'https://i.ibb.co/FFBQjtd/577042863-1456895286440707-6069203572316920901-n.jpg';
    private static $platformUrl = 'https://basstnhalk.vercel.app';
    private static $platformName = 'السير الشامي';

    public static function sendContactAdminNotification($to, $name, $email, $phone, $message) {
        $safeName = htmlspecialchars($name);
        $safeEmail = htmlspecialchars($email);
        $safePhone = htmlspecialchars($phone ?: '');
        $safeMsg = nl2br(htmlspecialchars($message));
        $safePlatform = htmlspecialchars($_ENV['MAIL_BRAND_NAME'] ?? self::$platformName);
        $logo = $_ENV['MAIL_BRAND_LOGO'] ?? self::$logoUrl;
        $banner = $_ENV['MAIL_BRAND_BANNER'] ?? self::$bannerUrl;
        $url = $_ENV['PLATFORM_URL'] ?? self::$platformUrl;
        
        // Classical color scheme
        $primary = '#C9A961';      // Golden
        $secondary = '#8B7355';    // Brown
        $dark = '#2C1810';         // Dark brown
        $cream = '#F5F1E8';        // Cream background
        $card = '#FFFFFF';
        $border = '#D4C4A8';
        $textMain = '#2C1810';
        $textSub = '#6B5847';
        
        $subject = "📩 رسالة تواصل جديدة - {$safePlatform}";
        $body = <<<HTML
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>رسالة تواصل جديدة</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;700;900&display=swap');
    </style>
</head>
<body style="margin:0;padding:0;font-family:'Cairo','Amiri',serif;background-color:{$cream};direction:rtl;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:{$cream};padding:30px 10px;">
        <tr><td align="center">
            <!-- Decorative Border Top -->
            <div style="max-width:600px;margin:0 auto;height:8px;background:linear-gradient(90deg,{$primary} 0%,{$secondary} 50%,{$primary} 100%);border-radius:4px 4px 0 0;"></div>
            
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:{$card};border-left:3px solid {$border};border-right:3px solid {$border};box-shadow:0 15px 35px rgba(44,24,16,0.15);">
                
                <!-- Classic Header with Banner -->
                <tr>
                    <td style="position:relative;padding:0;">
                        <div style="height:180px;background-image:url('{$banner}');background-size:cover;background-position:center;position:relative;border-bottom:4px solid {$primary};">
                            <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(44,24,16,0.3) 0%,rgba(44,24,16,0.7) 100%);"></div>
                            <!-- Decorative Corner -->
                            <div style="position:absolute;top:0;right:0;width:0;height:0;border-style:solid;border-width:0 60px 60px 0;border-color:transparent {$primary} transparent transparent;"></div>
                            <div style="position:absolute;top:0;left:0;width:0;height:0;border-style:solid;border-width:60px 60px 0 0;border-color:{$primary} transparent transparent transparent;"></div>
                        </div>
                    </td>
                </tr>
                
                <!-- Logo Section -->
                <tr>
                    <td style="text-align:center;padding:0;position:relative;">
                        <div style="margin-top:-60px;position:relative;z-index:10;">
                            <div style="display:inline-block;padding:6px;background:{$primary};border-radius:50%;box-shadow:0 8px 24px rgba(201,169,97,0.4);">
                                <img src="{$logo}" alt="{$safePlatform}" style="width:110px;height:110px;border-radius:50%;border:5px solid {$card};object-fit:cover;display:block;" />
                            </div>
                        </div>
                    </td>
                </tr>
                
                <!-- Content -->
                <tr>
                    <td style="padding:20px 40px 35px;text-align:center;">
                        <!-- Ornamental Divider -->
                        <div style="text-align:center;margin-bottom:20px;">
                            <span style="display:inline-block;color:{$primary};font-size:24px;">❖</span>
                        </div>
                        
                        <h1 style="margin:0 0 8px;font-family:'Amiri',serif;font-size:26px;font-weight:700;color:{$textMain};text-shadow:1px 1px 2px rgba(0,0,0,0.05);">رسالة تواصل جديدة</h1>
                        <p style="margin:0 0 25px;font-size:15px;color:{$textSub};line-height:1.8;">تم استلام رسالة من نموذج التواصل</p>
                        
                        <!-- Message Details Card -->
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:2px solid {$border};border-radius:8px;background:{$cream};margin-bottom:20px;">
                            <tr style="border-bottom:1px solid {$border};">
                                <td style="padding:14px 18px;width:130px;color:{$textSub};font-weight:700;text-align:right;background:linear-gradient(90deg,{$cream} 0%,rgba(255,255,255,0.5) 100%);">الاسم</td>
                                <td style="padding:14px 18px;color:{$textMain};font-weight:600;text-align:right;">{$safeName}</td>
                            </tr>
                            <tr style="border-bottom:1px solid {$border};">
                                <td style="padding:14px 18px;color:{$textSub};font-weight:700;text-align:right;background:linear-gradient(90deg,{$cream} 0%,rgba(255,255,255,0.5) 100%);">البريد الإلكتروني</td>
                                <td style="padding:14px 18px;color:{$textMain};font-weight:600;text-align:right;direction:ltr;text-align:left;">{$safeEmail}</td>
                            </tr>
                            <tr>
                                <td style="padding:14px 18px;color:{$textSub};font-weight:700;text-align:right;background:linear-gradient(90deg,{$cream} 0%,rgba(255,255,255,0.5) 100%);">رقم الهاتف</td>
                                <td style="padding:14px 18px;color:{$textMain};font-weight:600;text-align:right;direction:ltr;text-align:left;">{$safePhone}</td>
                            </tr>
                        </table>
                        
                        <!-- Message Content -->
                        <div style="margin:20px 0;padding:18px;border:3px double {$border};border-radius:8px;background:{$card};text-align:right;box-shadow:inset 0 2px 8px rgba(0,0,0,0.03);">
                            <div style="margin-bottom:10px;color:{$primary};font-weight:800;font-size:15px;font-family:'Amiri',serif;">✦ نص الرسالة ✦</div>
                            <div style="color:{$textMain};font-size:15px;line-height:2;font-family:'Cairo',sans-serif;">{$safeMsg}</div>
                        </div>
                        
                        <!-- Ornamental Divider -->
                        <div style="text-align:center;margin:25px 0 20px;">
                            <span style="display:inline-block;color:{$secondary};font-size:18px;">⟡ ⟡ ⟡</span>
                        </div>
                        
                        <!-- CTA Button -->
                        <a href="{$url}/admin/contact-messages" style="display:inline-block;background:linear-gradient(135deg,{$primary} 0%,{$secondary} 100%);color:{$card};text-decoration:none;padding:14px 35px;border-radius:6px;font-weight:800;font-size:16px;box-shadow:0 4px 15px rgba(201,169,97,0.3);border:2px solid {$primary};font-family:'Cairo',sans-serif;">
                            📋 فتح لوحة الإدارة
                        </a>
                    </td>
                </tr>
                
                <!-- Decorative Footer -->
                <tr>
                    <td style="background:linear-gradient(180deg,{$cream} 0%,{$card} 100%);padding:20px;text-align:center;border-top:3px double {$border};">
                        <div style="color:{$primary};font-size:20px;margin-bottom:8px;">✤</div>
                        <p style="margin:0;color:{$textSub};font-size:13px;font-family:'Amiri',serif;">© 2026 {$safePlatform} - جميع الحقوق محفوظة</p>
                    </td>
                </tr>
            </table>
            
            <!-- Decorative Border Bottom -->
            <div style="max-width:600px;margin:0 auto;height:8px;background:linear-gradient(90deg,{$primary} 0%,{$secondary} 50%,{$primary} 100%);border-radius:0 0 4px 4px;"></div>
        </td></tr>
    </table>
</body>
</html>
HTML;
        return self::send($to, $subject, $body);
    }

    public static function sendContactUserConfirmation($to, $name, $message) {
        $safeName = htmlspecialchars($name);
        $safeMsg = nl2br(htmlspecialchars($message));
        $safePlatform = htmlspecialchars($_ENV['MAIL_BRAND_NAME'] ?? self::$platformName);
        $logo = $_ENV['MAIL_BRAND_LOGO'] ?? self::$logoUrl;
        $banner = $_ENV['MAIL_BRAND_BANNER'] ?? self::$bannerUrl;
        $url = $_ENV['PLATFORM_URL'] ?? self::$platformUrl;
        
        // Classical color scheme
        $primary = '#C9A961';
        $secondary = '#8B7355';
        $dark = '#2C1810';
        $cream = '#F5F1E8';
        $card = '#FFFFFF';
        $border = '#D4C4A8';
        $textMain = '#2C1810';
        $textSub = '#6B5847';
        
        $subject = "✓ تم استلام رسالتك - {$safePlatform}";
        $body = <<<HTML
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تأكيد استلام الرسالة</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;700;900&display=swap');
    </style>
</head>
<body style="margin:0;padding:0;font-family:'Cairo','Amiri',serif;background-color:{$cream};direction:rtl;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:{$cream};padding:30px 10px;">
        <tr><td align="center">
            <div style="max-width:600px;margin:0 auto;height:8px;background:linear-gradient(90deg,{$primary} 0%,{$secondary} 50%,{$primary} 100%);border-radius:4px 4px 0 0;"></div>
            
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:{$card};border-left:3px solid {$border};border-right:3px solid {$border};box-shadow:0 15px 35px rgba(44,24,16,0.15);">
                
                <tr>
                    <td style="position:relative;padding:0;">
                        <div style="height:180px;background-image:url('{$banner}');background-size:cover;background-position:center;position:relative;border-bottom:4px solid {$primary};">
                            <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(44,24,16,0.3) 0%,rgba(44,24,16,0.7) 100%);"></div>
                            <div style="position:absolute;top:0;right:0;width:0;height:0;border-style:solid;border-width:0 60px 60px 0;border-color:transparent {$primary} transparent transparent;"></div>
                            <div style="position:absolute;top:0;left:0;width:0;height:0;border-style:solid;border-width:60px 60px 0 0;border-color:{$primary} transparent transparent transparent;"></div>
                        </div>
                    </td>
                </tr>
                
                <tr>
                    <td style="text-align:center;padding:0;position:relative;">
                        <div style="margin-top:-60px;position:relative;z-index:10;">
                            <div style="display:inline-block;padding:6px;background:{$primary};border-radius:50%;box-shadow:0 8px 24px rgba(201,169,97,0.4);">
                                <img src="{$logo}" alt="{$safePlatform}" style="width:110px;height:110px;border-radius:50%;border:5px solid {$card};object-fit:cover;display:block;" />
                            </div>
                        </div>
                    </td>
                </tr>
                
                <tr>
                    <td style="padding:20px 40px 35px;text-align:center;">
                        <div style="text-align:center;margin-bottom:20px;">
                            <span style="display:inline-block;color:{$primary};font-size:24px;">❖</span>
                        </div>
                        
                        <h1 style="margin:0 0 8px;font-family:'Amiri',serif;font-size:26px;font-weight:700;color:{$textMain};">أهلاً وسهلاً {$safeName}</h1>
                        <p style="margin:0 0 25px;font-size:15px;color:{$textSub};line-height:1.8;">شكراً لتواصلك معنا، تم استلام رسالتك بنجاح<br/>وسنقوم بالرد عليك في أقرب وقت ممكن إن شاء الله</p>
                        
                        <div style="margin:20px 0;padding:18px;border:3px double {$border};border-radius:8px;background:{$card};text-align:right;box-shadow:inset 0 2px 8px rgba(0,0,0,0.03);">
                            <div style="margin-bottom:10px;color:{$primary};font-weight:800;font-size:15px;font-family:'Amiri',serif;">✦ نص رسالتك ✦</div>
                            <div style="color:{$textMain};font-size:15px;line-height:2;font-family:'Cairo',sans-serif;">{$safeMsg}</div>
                        </div>
                        
                        <div style="text-align:center;margin:25px 0 20px;">
                            <span style="display:inline-block;color:{$secondary};font-size:18px;">⟡ ⟡ ⟡</span>
                        </div>
                        
                        <a href="{$url}" style="display:inline-block;background:linear-gradient(135deg,{$primary} 0%,{$secondary} 100%);color:{$card};text-decoration:none;padding:14px 35px;border-radius:6px;font-weight:800;font-size:16px;box-shadow:0 4px 15px rgba(201,169,97,0.3);border:2px solid {$primary};font-family:'Cairo',sans-serif;">
                            🏛️ زيارة المنصة
                        </a>
                    </td>
                </tr>
                
                <tr>
                    <td style="background:linear-gradient(180deg,{$cream} 0%,{$card} 100%);padding:20px;text-align:center;border-top:3px double {$border};">
                        <div style="color:{$primary};font-size:20px;margin-bottom:8px;">✤</div>
                        <p style="margin:0;color:{$textSub};font-size:13px;font-family:'Amiri',serif;">© 2026 {$safePlatform} - جميع الحقوق محفوظة</p>
                    </td>
                </tr>
            </table>
            
            <div style="max-width:600px;margin:0 auto;height:8px;background:linear-gradient(90deg,{$primary} 0%,{$secondary} 50%,{$primary} 100%);border-radius:0 0 4px 4px;"></div>
        </td></tr>
    </table>
</body>
</html>
HTML;
        return self::send($to, $subject, $body);
    }

    public static function sendContactReply($to, $name, $reply) {
        $safeName = htmlspecialchars($name);
        $safeReply = nl2br(htmlspecialchars($reply));
        $safePlatform = htmlspecialchars($_ENV['MAIL_BRAND_NAME'] ?? self::$platformName);
        $logo = $_ENV['MAIL_BRAND_LOGO'] ?? self::$logoUrl;
        $banner = $_ENV['MAIL_BRAND_BANNER'] ?? self::$bannerUrl;
        
        $primary = '#C9A961';
        $secondary = '#8B7355';
        $dark = '#2C1810';
        $cream = '#F5F1E8';
        $card = '#FFFFFF';
        $border = '#D4C4A8';
        $textMain = '#2C1810';
        $textSub = '#6B5847';
        
        $subject = "📧 رد على استفسارك - {$safePlatform}";
        $body = <<<HTML
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>رد على استفسارك</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;700;900&display=swap');
    </style>
</head>
<body style="margin:0;padding:0;font-family:'Cairo','Amiri',serif;background-color:{$cream};direction:rtl;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:{$cream};padding:30px 10px;">
        <tr><td align="center">
            <div style="max-width:600px;margin:0 auto;height:8px;background:linear-gradient(90deg,{$primary} 0%,{$secondary} 50%,{$primary} 100%);border-radius:4px 4px 0 0;"></div>
            
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:{$card};border-left:3px solid {$border};border-right:3px solid {$border};box-shadow:0 15px 35px rgba(44,24,16,0.15);">
                
                <tr>
                    <td style="position:relative;padding:0;">
                        <div style="height:180px;background-image:url('{$banner}');background-size:cover;background-position:center;position:relative;border-bottom:4px solid {$primary};">
                            <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(44,24,16,0.3) 0%,rgba(44,24,16,0.7) 100%);"></div>
                            <div style="position:absolute;top:0;right:0;width:0;height:0;border-style:solid;border-width:0 60px 60px 0;border-color:transparent {$primary} transparent transparent;"></div>
                            <div style="position:absolute;top:0;left:0;width:0;height:0;border-style:solid;border-width:60px 60px 0 0;border-color:{$primary} transparent transparent transparent;"></div>
                        </div>
                    </td>
                </tr>
                
                <tr>
                    <td style="text-align:center;padding:0;position:relative;">
                        <div style="margin-top:-60px;position:relative;z-index:10;">
                            <div style="display:inline-block;padding:6px;background:{$primary};border-radius:50%;box-shadow:0 8px 24px rgba(201,169,97,0.4);">
                                <img src="{$logo}" alt="{$safePlatform}" style="width:110px;height:110px;border-radius:50%;border:5px solid {$card};object-fit:cover;display:block;" />
                            </div>
                        </div>
                    </td>
                </tr>
                
                <tr>
                    <td style="padding:20px 40px 35px;text-align:center;">
                        <div style="text-align:center;margin-bottom:20px;">
                            <span style="display:inline-block;color:{$primary};font-size:24px;">❖</span>
                        </div>
                        
                        <h1 style="margin:0 0 8px;font-family:'Amiri',serif;font-size:26px;font-weight:700;color:{$textMain};">عزيزي {$safeName}</h1>
                        <p style="margin:0 0 25px;font-size:15px;color:{$textSub};line-height:1.8;">بخصوص استفسارك الكريم، تجد أدناه الرد التالي:</p>
                        
                        <div style="margin:20px 0;padding:18px;border:3px double {$border};border-radius:8px;background:{$card};text-align:right;box-shadow:inset 0 2px 8px rgba(0,0,0,0.03);">
                            <div style="margin-bottom:10px;color:{$primary};font-weight:800;font-size:15px;font-family:'Amiri',serif;">✦ الرد ✦</div>
                            <div style="color:{$textMain};font-size:15px;line-height:2;font-family:'Cairo',sans-serif;">{$safeReply}</div>
                        </div>
                        
                        <div style="text-align:center;margin:25px 0;">
                            <span style="display:inline-block;color:{$secondary};font-size:18px;">⟡ ⟡ ⟡</span>
                        </div>
                        
                        <p style="margin:15px 0;font-size:14px;color:{$textSub};line-height:1.8;font-family:'Cairo',sans-serif;">
                            إذا كان لديك أي استفسارات أخرى، لا تتردد في التواصل معنا
                        </p>
                    </td>
                </tr>
                
                <tr>
                    <td style="background:linear-gradient(180deg,{$cream} 0%,{$card} 100%);padding:20px;text-align:center;border-top:3px double {$border};">
                        <div style="color:{$primary};font-size:20px;margin-bottom:8px;">✤</div>
                        <p style="margin:0;color:{$textSub};font-size:13px;font-family:'Amiri',serif;">© 2026 {$safePlatform} - جميع الحقوق محفوظة</p>
                    </td>
                </tr>
            </table>
            
            <div style="max-width:600px;margin:0 auto;height:8px;background:linear-gradient(90deg,{$primary} 0%,{$secondary} 50%,{$primary} 100%);border-radius:0 0 4px 4px;"></div>
        </td></tr>
    </table>
</body>
</html>
HTML;
        return self::send($to, $subject, $body);
    }

    /**
     * Send verification email to student
     */
    public static function sendVerificationCode($email, $name, $code) {
        $subject = "🔐 كود التفعيل - " . self::$platformName;
        
        $safeName = htmlspecialchars($name);
        $safeCode = htmlspecialchars($code);
        $safePlatform = htmlspecialchars(self::$platformName);
        
        $logo = self::$logoUrl;
        $banner = self::$bannerUrl;
        $url = self::$platformUrl;
        
        // Classical color scheme
        $primary = '#C9A961';
        $secondary = '#8B7355';
        $dark = '#2C1810';
        $cream = '#F5F1E8';
        $card = '#FFFFFF';
        $border = '#D4C4A8';
        $textMain = '#2C1810';
        $textSub = '#6B5847';
        
        $body = <<<HTML
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>كود التفعيل</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;700;900&display=swap');
    </style>
</head>
<body style="margin:0;padding:0;font-family:'Cairo','Amiri',serif;background-color:{$cream};direction:rtl;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:{$cream};padding:30px 10px;">
        <tr><td align="center">
            <!-- Top Decorative Border -->
            <div style="max-width:600px;margin:0 auto;height:8px;background:linear-gradient(90deg,{$primary} 0%,{$secondary} 50%,{$primary} 100%);border-radius:4px 4px 0 0;"></div>
            
            <!-- Main Card -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:{$card};border-left:3px solid {$border};border-right:3px solid {$border};box-shadow:0 15px 35px rgba(44,24,16,0.15);">
                
                <!-- Classical Header with Banner -->
                <tr>
                    <td style="position:relative;padding:0;">
                        <div style="height:180px;background-image:url('{$banner}');background-size:cover;background-position:center;position:relative;border-bottom:4px solid {$primary};">
                            <!-- Dark Overlay -->
                            <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(44,24,16,0.3) 0%,rgba(44,24,16,0.7) 100%);"></div>
                            <!-- Decorative Corners -->
                            <div style="position:absolute;top:0;right:0;width:0;height:0;border-style:solid;border-width:0 60px 60px 0;border-color:transparent {$primary} transparent transparent;"></div>
                            <div style="position:absolute;top:0;left:0;width:0;height:0;border-style:solid;border-width:60px 60px 0 0;border-color:{$primary} transparent transparent transparent;"></div>
                        </div>
                    </td>
                </tr>

                <!-- Floating Logo -->
                <tr>
                    <td style="text-align:center;padding:0;position:relative;">
                        <div style="margin-top:-60px;position:relative;z-index:10;">
                            <div style="display:inline-block;padding:6px;background:{$primary};border-radius:50%;box-shadow:0 8px 24px rgba(201,169,97,0.4);">
                                <img src="{$logo}" alt="{$safePlatform}" style="width:110px;height:110px;border-radius:50%;border:5px solid {$card};object-fit:cover;display:block;" />
                            </div>
                        </div>
                    </td>
                </tr>

                <!-- Content Section -->
                <tr>
                    <td style="padding:20px 40px 35px;text-align:center;">
                        <!-- Ornamental Divider -->
                        <div style="text-align:center;margin-bottom:20px;">
                            <span style="display:inline-block;color:{$primary};font-size:24px;">❖</span>
                        </div>
                        
                        <h1 style="margin:0 0 8px;font-family:'Amiri',serif;font-size:26px;font-weight:700;color:{$textMain};text-shadow:1px 1px 2px rgba(0,0,0,0.05);">
                            مرحباً بك {$safeName}
                        </h1>
                        <p style="margin:0 0 25px;font-size:15px;color:{$textSub};line-height:1.8;">
                            لاستكمال عملية تسجيل الدخول إلى حسابك<br/>
                            يرجى استخدام كود التفعيل التالي:
                        </p>

                        <!-- Verification Code Box -->
                        <div style="background:linear-gradient(135deg,{$cream} 0%,{$card} 100%);border:3px double {$border};border-radius:12px;padding:25px 20px;margin:20px 0;box-shadow:inset 0 2px 8px rgba(0,0,0,0.05);">
                            <!-- Decorative Top -->
                            <div style="text-align:center;margin-bottom:12px;">
                                <span style="color:{$secondary};font-size:18px;">⟡ ⟡ ⟡</span>
                            </div>
                            
                            <div style="letter-spacing:14px;font-size:38px;font-weight:900;color:{$primary};font-family:'Courier New',monospace;text-shadow:2px 2px 4px rgba(0,0,0,0.1);margin:10px 0;">
                                {$safeCode}
                            </div>
                            
                            <!-- Decorative Bottom -->
                            <div style="text-align:center;margin-top:12px;margin-bottom:8px;">
                                <span style="color:{$secondary};font-size:18px;">⟡ ⟡ ⟡</span>
                            </div>
                            
                            <div style="margin-top:12px;padding-top:12px;border-top:1px dashed {$border};">
                                <span style="display:inline-block;font-size:13px;color:{$textSub};font-weight:700;font-family:'Cairo',sans-serif;">
                                    ⏳ صالح لمدة 15 دقيقة فقط
                                </span>
                            </div>
                        </div>

                        <!-- Ornamental Divider -->
                        <div style="text-align:center;margin:25px 0 20px;">
                            <span style="display:inline-block;color:{$secondary};font-size:18px;">⟡ ⟡ ⟡</span>
                        </div>

                        <!-- CTA Button -->
                        <a href="{$url}/login" style="display:inline-block;background:linear-gradient(135deg,{$primary} 0%,{$secondary} 100%);color:{$card};text-decoration:none;padding:14px 35px;border-radius:6px;font-weight:800;font-size:16px;box-shadow:0 4px 15px rgba(201,169,97,0.3);border:2px solid {$primary};font-family:'Cairo',sans-serif;">
                            🔓 تسجيل الدخول الآن
                        </a>
                        
                        <!-- Security Note -->
                        <p style="margin:25px 0 0;font-size:13px;color:{$textSub};line-height:1.7;padding:12px;background:{$cream};border-radius:6px;border-right:3px solid {$secondary};">
                            <strong style="color:{$textMain};">ملاحظة أمنية:</strong><br/>
                            لا تشارك هذا الكود مع أي شخص. فريق {$safePlatform} لن يطلب منك هذا الكود أبداً.
                        </p>
                    </td>
                </tr>

                <!-- Classical Footer -->
                <tr>
                    <td style="background:linear-gradient(180deg,{$cream} 0%,{$card} 100%);padding:20px;text-align:center;border-top:3px double {$border};">
                        <div style="color:{$primary};font-size:20px;margin-bottom:8px;">✤</div>
                        <p style="margin:0;color:{$textSub};font-size:13px;font-family:'Amiri',serif;">
                            © 2026 {$safePlatform} - جميع الحقوق محفوظة
                        </p>
                    </td>
                </tr>
            </table>

            <!-- Bottom Decorative Border -->
            <div style="max-width:600px;margin:0 auto;height:8px;background:linear-gradient(90deg,{$primary} 0%,{$secondary} 50%,{$primary} 100%);border-radius:0 0 4px 4px;"></div>

            <!-- Email Info Text -->
            <p style="text-align:center;margin-top:20px;color:{$textSub};font-size:12px;opacity:0.7;font-family:'Cairo',sans-serif;">
                تصلك هذه الرسالة لأنك قمت بطلب تسجيل الدخول إلى حسابك
            </p>

        </td></tr>
    </table>
</body>
</html>
HTML;
        
        error_log("Sending Verification Email to: $email with code: $code");
        return self::send($email, $subject, $body);
    }

    /**
     * Send email using SMTP
     */
    public static function send($to, $subject, $htmlBody) {
        $mail = new PHPMailer(true);

        try {
            // SMTP Configuration
            $mail->isSMTP();
            $mail->Host = $_ENV['MAIL_HOST'] ?? 'smtp-relay.brevo.com';
            $mail->SMTPAuth = true;
            $mail->Username = $_ENV['MAIL_USERNAME'] ?? '';
            $mail->Password = $_ENV['MAIL_PASSWORD'] ?? '';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = $_ENV['MAIL_PORT'] ?? 587;
            $mail->CharSet = 'UTF-8';

            // Sender
            $fromAddress = $_ENV['MAIL_FROM_ADDRESS'] ?? 'noreply@bacaloria.com';
            $fromName = $_ENV['MAIL_FROM_NAME'] ?? 'السير الشامي';
            $mail->setFrom($fromAddress, $fromName);

            // Recipient
            $mail->addAddress($to);

            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $htmlBody;

            $mail->send();
            error_log("Email sent successfully to: $to");
            return true;

        } catch (Exception $e) {
            error_log("Email Error: " . $mail->ErrorInfo);
            return false;
        }
    }
}