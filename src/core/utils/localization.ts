/**
 * Utility to format backend keys into human-readable Arabic names
 */

export const LEVEL_NAME_MAP: Record<string, string> = {
    // Stages
    'primary': 'المرحلة الابتدائية',
    'prep': 'المرحلة الإعدادية',
    'secondary': 'المرحلة الثانوية',

    // Grade Levels (Numeric or Keyed)
    '1': 'الصف الأول الابتدائي',
    '2': 'الصف الثاني الابتدائي',
    '3': 'الصف الثالث الابتدائي',
    '4': 'الصف الرابع الابتدائي',
    '5': 'الصف الخامس الابتدائي',
    '6': 'الصف السادس الابتدائي',
    '7': 'الصف الأول الإعدادي',
    '8': 'الصف الثاني الإعدادي',
    '9': 'الصف الثالث الإعدادي',
    '10': 'الصف الأول الثانوي',
    '11': 'الصف الثاني الثانوي',
    '12': 'الصف الثالث الثانوي',

    // Legacy or Internal Keys
    'first_prep': 'الصف الأول الإعدادي',
    'second_prep': 'الصف الثاني الإعدادي',
    'third_prep': 'الصف الثالث الإعدادي',
    'first_secondary': 'الصف الأول الثانوي',
    'second_secondary': 'الصف الثاني الثانوي',
    'third_secondary': 'الصف الثالث الثانوي',
};

export function formatGradeLevel(level: string | null | undefined): string {
    if (!level) return 'غير محدد';
    const cleanLevel = level.toString().toLowerCase().trim();
    return LEVEL_NAME_MAP[cleanLevel] || level;
}

export function formatStage(stage: string | null | undefined): string {
    if (!stage) return 'غير محدد';
    const cleanStage = stage.toString().toLowerCase().trim();
    return LEVEL_NAME_MAP[cleanStage] || stage;
}
