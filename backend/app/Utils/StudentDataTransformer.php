<?php

namespace App\Utils;

use App\Services\EnrollmentSecurityService;

/**
 * StudentDataTransformer
 * 
 * Filters sensitive student data based on access level.
 * Ensures privacy fields are only visible to authorized teachers.
 */
class StudentDataTransformer
{
    /**
     * Sensitive fields that require enrollment verification.
     * These fields are hidden unless the teacher has access via enrollment.
     */
    private const SENSITIVE_FIELDS = [
        'parent_phone',
        'guardian_name',
        'school_name',
        'birth_date',
        'governorate',
        'city'
    ];

    /**
     * Fields always visible in listings (non-sensitive).
     */
    private const PUBLIC_FIELDS = [
        'id',
        'name',
        'email',
        'phone',
        'avatar',
        'status',
        'grade_level',
        'education_stage',
        'created_at'
    ];

    /**
     * Transform a single student record.
     * Filters out sensitive data if the current user doesn't have enrollment access.
     * 
     * @param array $student Raw student data from database
     * @param bool $forceShowAll Override to show all fields (for admin)
     * @return array Transformed student data
     */
    public static function transform(array $student, bool $forceShowAll = false): array
    {
        // Check if current user is admin (show all)
        $role = \App\Utils\SecureSession::get('role');
        if ($role === 'admin' || $forceShowAll) {
            return self::addAccessLevel($student, 'full');
        }

        // Check enrollment-based access
        $currentUserId = \App\Utils\SecureSession::get('user_id');
        $hasAccess = EnrollmentSecurityService::canAccessStudent($currentUserId, $student['id']);

        if ($hasAccess) {
            return self::addAccessLevel($student, 'enrolled');
        }

        // Filter out sensitive fields
        return self::filterSensitiveFields($student);
    }

    /**
     * Transform multiple student records.
     * 
     * @param array $students Array of student records
     * @param bool $forceShowAll Override to show all fields
     * @return array Transformed students
     */
    public static function transformMany(array $students, bool $forceShowAll = false): array
    {
        return array_map(
            fn($student) => self::transform($student, $forceShowAll),
            $students
        );
    }

    /**
     * Filter sensitive fields from student data.
     * 
     * @param array $student Raw student data
     * @return array Filtered student data
     */
    private static function filterSensitiveFields(array $student): array
    {
        $filtered = [];

        foreach ($student as $key => $value) {
            if (in_array($key, self::SENSITIVE_FIELDS)) {
                // Replace sensitive field with masked indicator
                $filtered[$key] = null;
            } else {
                $filtered[$key] = $value;
            }
        }

        return self::addAccessLevel($filtered, 'limited');
    }

    /**
     * Add access level indicator to the data.
     * 
     * @param array $data Student data
     * @param string $level Access level (full, enrolled, limited)
     * @return array Data with access level
     */
    private static function addAccessLevel(array $data, string $level): array
    {
        $data['_access_level'] = $level;
        $data['_has_full_access'] = $level !== 'limited';
        return $data;
    }

    /**
     * Get only public fields from a student record.
     * Used for search results and listings where enrollment isn't verified.
     * 
     * @param array $student Raw student data
     * @return array Public fields only
     */
    public static function getPublicFields(array $student): array
    {
        $public = [];

        foreach (self::PUBLIC_FIELDS as $field) {
            if (isset($student[$field])) {
                $public[$field] = $student[$field];
            }
        }

        $public['_access_level'] = 'public';
        $public['_has_full_access'] = false;

        return $public;
    }

    /**
     * Check if a specific field is sensitive.
     * 
     * @param string $fieldName Field name to check
     * @return bool True if sensitive
     */
    public static function isSensitiveField(string $fieldName): bool
    {
        return in_array($fieldName, self::SENSITIVE_FIELDS);
    }

    /**
     * Get the list of sensitive fields.
     * 
     * @return array List of sensitive field names
     */
    public static function getSensitiveFields(): array
    {
        return self::SENSITIVE_FIELDS;
    }

    /**
     * Transform student for detailed profile view.
     * Includes enrollment info and course data.
     * 
     * @param array $student Student data
     * @param array $enrollments Optional enrollment data
     * @return array Enhanced student profile
     */
    public static function transformProfile(array $student, array $enrollments = []): array
    {
        $transformed = self::transform($student);
        
        // Add enrollment summary if access is granted
        if ($transformed['_has_full_access']) {
            $transformed['enrollments'] = $enrollments;
            $transformed['enrollment_count'] = count($enrollments);
        }

        return $transformed;
    }
}
