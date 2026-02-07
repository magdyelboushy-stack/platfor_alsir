<?php

namespace App\Config;

use PDO;
use PDOException;

class Database {
    private static $instance = null;
    private $conn;
    private $config;

    private function __construct() {
        $this->loadConfig();
        $this->connect();
    }

    /**
     * تحميل إعدادات قاعدة البيانات
     */
    private function loadConfig() {
        $this->config = [
            'host' => $_ENV['DB_HOST'] ?? 'localhost',
            'port' => $_ENV['DB_PORT'] ?? '3306',
            'database' => $_ENV['DB_DATABASE'] ?? 'bacaloria_db',
            'username' => $_ENV['DB_USERNAME'] ?? 'root',
            'password' => $_ENV['DB_PASSWORD'] ?? '',
            'charset' => $_ENV['DB_CHARSET'] ?? 'utf8mb4',
            'collation' => $_ENV['DB_COLLATION'] ?? 'utf8mb4_unicode_ci',
        ];
    }

    /**
     * الاتصال بقاعدة البيانات بشكل آمن
     */
    private function connect() {
        try {
            $dsn = sprintf(
                "mysql:host=%s;port=%s;dbname=%s;charset=%s",
                $this->config['host'],
                $this->config['port'],
                $this->config['database'],
                $this->config['charset']
            );

            $options = [
                // وضع الأخطاء على Exceptions
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                
                // الحصول على النتائج كـ Associative Array
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                
                // تعطيل Prepared Statement Emulation (أمان أفضل)
                PDO::ATTR_EMULATE_PREPARES => false,
                
                // تعيين timeout للاتصال
                PDO::ATTR_TIMEOUT => 5,
                
                // استخدام Native Prepared Statements
                PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => true,
                
                // تشفير الاتصال (SSL) إذا كان متاحاً
                // PDO::MYSQL_ATTR_SSL_CA => '/path/to/ca-cert.pem',
                // PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => true,
            ];

            $this->conn = new PDO(
                $dsn,
                $this->config['username'],
                $this->config['password'],
                $options
            );

            // تعيين الـ Collation
            $this->conn->exec("SET NAMES {$this->config['charset']} COLLATE {$this->config['collation']}");
            
            // تعيين timezone
            $this->conn->exec("SET time_zone = '+00:00'");
            
            // تفعيل strict mode (منع البيانات غير الصحيحة)
            $this->conn->exec("SET sql_mode = 'STRICT_ALL_TABLES'");

            // Set session variables for audit triggers
            $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
            $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'CLI/Unknown';
            $this->conn->exec("SET @current_ip = " . $this->conn->quote($ip));
            $this->conn->exec("SET @current_user_agent = " . $this->conn->quote($ua));

        } catch (PDOException $e) {
            // عدم كشف تفاصيل الاتصال في رسالة الخطأ
            error_log("Database connection error: " . $e->getMessage());
            
            // في بيئة الإنتاج
            if ($_ENV['APP_ENV'] === 'production') {
                die("عذراً، حدث خطأ في الاتصال بقاعدة البيانات. يرجى المحاولة لاحقاً.");
            } else {
                // في بيئة التطوير فقط
                die("Database Connection Error: " . $e->getMessage());
            }
        }
    }

    /**
     * الحصول على Instance واحد من Database (Singleton Pattern)
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * الحصول على الاتصال
     */
    public function getConnection() {
        // التحقق من أن الاتصال لا يزال حياً
        if (!$this->isConnected()) {
            $this->connect();
        }
        
        return $this->conn;
    }

    /**
     * فحص حالة الاتصال
     */
    private function isConnected() {
        try {
            $this->conn->query('SELECT 1');
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }

    /**
     * تنفيذ استعلام بشكل آمن
     */
    public function query($sql, $params = []) {
        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Query error: " . $e->getMessage());
            error_log("SQL: " . $sql);
            throw new \Exception("خطأ في تنفيذ الاستعلام");
        }
    }

    /**
     * بدء Transaction
     */
    public function beginTransaction() {
        return $this->conn->beginTransaction();
    }

    /**
     * تنفيذ Commit
     */
    public function commit() {
        return $this->conn->commit();
    }

    /**
     * تنفيذ Rollback
     */
    public function rollback() {
        return $this->conn->rollBack();
    }

    /**
     * الحصول على آخر ID تم إدراجه
     */
    public function lastInsertId() {
        return $this->conn->lastInsertId();
    }

    /**
     * تنظيف وإغلاق الاتصال
     */
    public function close() {
        $this->conn = null;
    }

    /**
     * منع النسخ (Singleton Pattern)
     */
    private function __clone() {}

    /**
     * منع Unserialization (Singleton Pattern)
     */
    public function __wakeup() {
        throw new \Exception("Cannot unserialize singleton");
    }
}