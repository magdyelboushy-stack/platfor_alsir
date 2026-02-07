export const EDUCATION_MAPPING: Record<string, string> = {
    // Stages
    'primary': 'المرحلة الابتدائية',
    'prep': 'المرحلة الإعدادية',
    'secondary': 'المرحلة الثانوية',

    // Grades
    '4': 'الصف الرابع الابتدائى',
    '5': 'الصف الخامس الابتدائى',
    '6': 'الصف السادس الابتدائى',
    '7': 'الصف الأول الإعدادي',
    '8': 'الصف الثاني الإعدادي',
    '9': 'الصف الثالث الإعدادي',
    '10': 'الصف الأول الثانوي',
    '11': 'الصف الثاني الثانوي',
    '12': 'الصف الثالث الثانوي',
};

export const EDUCATION_SYSTEM = [
    {
        id: 'primary',
        name: 'المرحلة الابتدائية',
        grades: [
            { id: '4', name: 'الصف الرابع الابتدائى' },
            { id: '5', name: 'الصف الخامس الابتدائى' },
            { id: '6', name: 'الصف السادس الابتدائى' },
        ]
    },
    {
        id: 'prep',
        name: 'المرحلة الإعدادية',
        grades: [
            { id: '7', name: 'الصف الأول الإعدادي' },
            { id: '8', name: 'الصف الثاني الإعدادي' },
            { id: '9', name: 'الصف الثالث الإعدادي' },
        ]
    },
    {
        id: 'secondary',
        name: 'المرحلة الثانوية',
        grades: [
            { id: '10', name: 'الصف الأول الثانوي' },
            { id: '11', name: 'الصف الثاني الثانوي' },
            { id: '12', name: 'الصف الثالث الثانوي' },
        ]
    }
];

export const formatEducationValue = (value: string | number) => {
    const strValue = String(value);
    return EDUCATION_MAPPING[strValue] || strValue;
};
