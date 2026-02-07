<?php

namespace App\Utils;

use App\Config\Database;

class Validator {
    private $errors = [];
    private $db;

    // Whitelist for allowed tables and columns (SQL Injection protection)
    private const ALLOWED_TABLES = [
        'users' => ['email', 'phone', 'parent_phone', 'name']
    ];

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function validate($data, $rules) {
        foreach ($rules as $field => $ruleString) {
            $rulesArray = explode('|', $ruleString);
            foreach ($rulesArray as $rule) {
                $value = $data[$field] ?? null;
                $this->applyRule($field, $value, $rule, $data);
            }
        }
        return empty($this->errors);
    }

    private function applyRule($field, $value, $rule, $data = []) {
        // Required validation
        if ($rule === 'required' && empty($value) && $value !== '0') {
            $this->addError($field, "$field field is required");
            return;
        }

        // If field is empty and not required, skip other rules
        if (empty($value) && $value !== '0') {
            return;
        }

        // Email validation
        if ($rule === 'email') {
            if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                $this->addError($field, "Invalid email format");
            }
            if (strlen($value) > 255) {
                $this->addError($field, "Email is too long");
            }
            
            // ✅ SECURITY FIX: Validate email domain has MX records (prevents typos like gmail.comm)
            $parts = explode('@', $value);
            if (count($parts) === 2) {
                $domain = $parts[1];
                if (!checkdnsrr($domain, 'MX')) {
                    $this->addError($field, "Email domain does not accept mail. Please check spelling (e.g., gmail.com, yahoo.com)");
                }
            }
        }

        // Min length validation
        if (strpos($rule, 'min:') === 0) {
            $min = (int) substr($rule, 4);
            if (strlen($value) < $min) {
                $this->addError($field, "$field must be at least $min characters");
            }
        }

        // Max length validation
        if (strpos($rule, 'max:') === 0) {
            $max = (int) substr($rule, 4);
            if (mb_strlen($value) > $max) {
                $this->addError($field, "$field must not exceed $max characters");
            }
        }

        // Exact size validation
        if (strpos($rule, 'size:') === 0) {
            $size = (int) substr($rule, 5);
            if (strlen($value) !== $size) {
                $this->addError($field, "$field must be exactly $size characters");
            }
        }

        // Different from another field
        if (strpos($rule, 'different:') === 0) {
            $otherField = substr($rule, 10);
            if (empty($value) && empty($data[$otherField])) {
                // both empty, skip (or handle as needed)
            } else {
                // Use hash_equals to prevent timing attacks
                $val1 = (string)$value;
                $val2 = (string)($data[$otherField] ?? '');
                
                if (hash_equals($val1, $val2)) {
                    if ($field === 'parent_phone' && $otherField === 'phone') {
                        $this->addError($field, "مينفعش رقم ولي الأمر يبقى نفس رقمك! لازم رقم باباك أو مامتك عشان نتواصل معاهم في الطوارئ 👨‍👩‍👦");
                    } else {
                        $this->addError($field, "$field must be different from $otherField");
                    }
                }
            }
        }

        // Numeric validation
        if ($rule === 'numeric') {
            if (!ctype_digit((string)$value)) {
                $this->addError($field, "This field must contain numbers only");
            }
        }

        // Date validation
        if ($rule === 'date') {
            $timestamp = strtotime($value);
            if (!$timestamp) {
                $this->addError($field, "Invalid date format (use YYYY-MM-DD)");
            } else {
                // Logic check: not in future for birth date
                if ($field === 'birth_date' && $timestamp > time()) {
                    $this->addError($field, "Birth date cannot be in the future");
                }
                // Age check (5-100 years)
                if ($field === 'birth_date') {
                    $age = (time() - $timestamp) / (365 * 24 * 60 * 60);
                    if ($age < 5 || $age > 100) {
                        $this->addError($field, "Invalid birth date (Age logic)");
                    }
                }
            }
        }

            if ($rule === 'password_strength') {
                $errors = [];
                if (!preg_match('/[A-Z]/', $value)) {
                    $errors[] = "حرف إنجليزي كبير (A-Z)";
                }
                if (!preg_match('/[a-z]/', $value)) {
                    $errors[] = "حرف إنجليزي صغير (a-z)";
                }
                if (!preg_match('/[0-9]/', $value)) {
                    $errors[] = "رقم واحد على الأقل (0-9)";
                }
                if (!preg_match('/[!@#$%^&*(),.?":{}|<>]/', $value)) {
                    $errors[] = "رمز خاص (!@#$%^&*)";
                }
                if (strlen($value) < 8) {
                    $errors[] = "8 أحرف على الأقل";
                }
                
                if (!empty($errors)) {
                    $this->addError($field, "كلمة المرور ضعيفة، يجب أن تحتوي على: " . implode("، ", $errors));
                }

                if ($this->isCommonPassword($value)) {
                    $this->addError($field, "كلمة المرور شائعة جداً، اختر كلمة أصعب");
                }
            }

        // Unique validation (SQL Injection protected)
        if (strpos($rule, 'unique:') === 0) {
            $params = substr($rule, 7);
            $parts = explode(',', $params);
            
            if (count($parts) !== 2) {
                return; // Invalid rule format
            }
            
            list($table, $column) = $parts;
            
            // Validate table and column against whitelist
            if (!isset(self::ALLOWED_TABLES[$table]) || 
                !in_array($column, self::ALLOWED_TABLES[$table])) {
                error_log("Validation: Attempted to access unauthorized table/column: $table.$column");
                return;
            }
            
            if (!empty($value)) {
                // Prepared statements with safe table/column names
                $sql = "SELECT COUNT(*) FROM `{$table}` WHERE `{$column}` = :value";
                $stmt = $this->db->prepare($sql);
                $stmt->execute(['value' => $value]);
                
                if ($stmt->fetchColumn() > 0) {
                    $this->addError($field, "هذا البيان مسجل بالفعل في النظام");
                }
            }
        }

        // URL validation
        if ($rule === 'url') {
            if (!filter_var($value, FILTER_VALIDATE_URL)) {
                $this->addError($field, "رابط غير صحيح");
            }
        }

        // In array validation
        if (strpos($rule, 'in:') === 0) {
            $allowedValues = explode(',', substr($rule, 3));
            if (!in_array($value, $allowedValues)) {
                $this->addError($field, "قيمة غير مقبولة: " . implode(', ', $allowedValues));
            }
        }

        // Regex validation
        if (strpos($rule, 'regex:') === 0) {
            $pattern = substr($rule, 6);
            if (!preg_match($pattern, $value)) {
                $this->addError($field, "تنسيق غير صحيح");
            }
        }

        // Egyptian phone validation
        if ($rule === 'egyptian_phone') {
            // Remove any spaces or dashes from the phone number
            $cleanValue = preg_replace('/[^0-9]/', '', $value);
            if (!preg_match('/^01[0-2|5]{1}[0-9]{8}$/', $cleanValue)) {
                $this->addError($field, "رقم الهاتف يجب أن يبدأ بـ 010, 011, 012, أو 015 ويكون 11 رقم");
            }
        }
    }

    private function addError($field, $message) {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        $this->errors[$field][] = $message;
    }

    public function getErrors() {
        return $this->errors;
    }

    /**
     * Check common passwords
     */
    private function isCommonPassword($password) {
        $commonPasswords = [
            'password', '12345678', 'password123', 'admin123', 
            'qwerty123', '123456789', 'password1', 'abc12345',
            'P@ssw0rd', 'Admin@123'
        ];
        
        return in_array(strtolower($password), array_map('strtolower', $commonPasswords));
    }


    /**
     * Sanitize Input (Proxy to new InputSanitizer)
     */
    public static function sanitizeInput($data) {
        return InputSanitizer::cleanXSS($data);
    }
}