<?php
/**
 * Repair script for teacher_files table
 * 1. Drops old foreign key if it points to 'users'
 * 2. Adds teacher_id column (the owner of the library)
 * 3. Updates existing records to set teacher_id = user_id (for existing teachers)
 * 4. Adds new foreign key to 'teachers' table
 */

require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$host = $_ENV['DB_HOST'] ?? 'localhost';
$db   = $_ENV['DB_DATABASE'] ?? 'bacaloria_db';
$user = $_ENV['DB_USERNAME'] ?? 'root';
$pass = $_ENV['DB_PASSWORD'] ?? '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "Connected to database successfully.\n";

    // 1. Drop old foreign key if it exists
    echo "Checking for old foreign keys...\n";
    try {
        $pdo->exec("ALTER TABLE teacher_files DROP FOREIGN KEY teacher_files_ibfk_1");
        echo "Dropped teacher_files_ibfk_1 (user_id -> users).\n";
    } catch (Exception $e) {
        echo "Note: teacher_files_ibfk_1 not found or already dropped.\n";
    }

    // 2. Add teacher_id column if not exists
    $columns = $pdo->query("DESCRIBE teacher_files")->fetchAll();
    $hasTeacherId = false;
    foreach ($columns as $col) {
        if ($col['Field'] === 'teacher_id') {
            $hasTeacherId = true;
            break;
        }
    }

    if (!$hasTeacherId) {
        echo "Adding teacher_id column...\n";
        $pdo->exec("ALTER TABLE teacher_files ADD COLUMN teacher_id VARCHAR(36) AFTER user_id");
        // For old records, teacher_id = user_id (assuming they were uploaded by teachers)
        $pdo->exec("UPDATE teacher_files SET teacher_id = user_id WHERE teacher_id IS NULL");
        echo "Column teacher_id added and synced.\n";
    }

    // 3. Update teacher_id to NOT NULL
    $pdo->exec("ALTER TABLE teacher_files MODIFY COLUMN teacher_id VARCHAR(36) NOT NULL");

    // 4. Add new foreign key to teachers table
    echo "Adding new foreign key constraint...\n";
    try {
        $pdo->exec("ALTER TABLE teacher_files ADD CONSTRAINT fk_teacher_files_owner 
                    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE");
        echo "Foreign key fk_teacher_files_owner added successfully.\n";
    } catch (Exception $e) {
        echo "Note: Could not add fk_teacher_files_owner (maybe already exists: " . $e->getMessage() . ").\n";
    }

    // 5. Also let's fix the user_id foreign key (uploader).
    // Assistants are in 'assistants' table, Teachers in 'teachers' table.
    // We can't have one user_id column pointing to two tables easily in MySQL with a strict FK.
    // So we'll just keep it as a column WITHOUT a strict FK to allow mixed roles, OR drop the constraint.
    // It's already dropped by step 1 if it was the only one.

    echo "\nDatabase repair for teacher_files completed successfully!\n";

} catch (\PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
