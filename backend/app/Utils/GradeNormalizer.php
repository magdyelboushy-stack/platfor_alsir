<?php

namespace App\Utils;

class GradeNormalizer {
    private static $map = [
        // Primary
        '4' => '4', 'fourth_primary' => '4',
        '5' => '5', 'fifth_primary' => '5',
        '6' => '6', 'sixth_primary' => '6',
        
        // Prep
        '7' => '7', 'first_prep' => '7',
        '8' => '8', 'second_prep' => '8',
        '9' => '9', 'third_prep' => '9',
        
        // Secondary
        '10' => '10', 'first_sec' => '10',
        '11' => '11', 'second_sec' => '11',
        '12' => '12', 'third_sec' => '12'
    ];

    /**
     * Normalize grade level to a numeric string (1-12)
     */
    public static function normalize($grade) {
        if (!$grade) return null;
        return self::$map[strtolower($grade)] ?? $grade;
    }

    /**
     * Get all variations for a specific normalized grade
     * Useful for SQL IN clauses
     */
    public static function getVariations($grade) {
        $normalized = self::normalize($grade);
        $variations = [$normalized];
        foreach (self::$map as $key => $val) {
            if ($val === $normalized) {
                $variations[] = $key;
            }
        }
        return array_unique($variations);
    }
}
