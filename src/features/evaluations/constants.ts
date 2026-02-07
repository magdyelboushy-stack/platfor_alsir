
import {
    BookOpen,
    Languages,
    FlaskConical,
    Atom,
    Microscope,
    Calculator,
    History,
    Globe,
    Lightbulb,
    Brain,
    Hexagon
} from 'lucide-react';

export const EVALUATION_SUBJECTS = [
    { id: 'arabic', ar: 'لغة عربية', en: 'Arabic Language', icon: BookOpen, color: 'Amber' },
    { id: 'english', ar: 'لغة إنجليزية', en: 'English Language', icon: Languages, color: 'Indigo' },
    { id: 'french', ar: 'لغة فرنسية', en: 'French Language', icon: Languages, color: 'Cyan' },
    { id: 'chemistry', ar: 'كيمياء', en: 'Chemistry', icon: FlaskConical, color: 'Emerald' },
    { id: 'physics', ar: 'فيزياء', en: 'Physics', icon: Atom, color: 'Purple' },
    { id: 'biology', ar: 'أحياء', en: 'Biology', icon: Microscope, color: 'Rose' },
    { id: 'math', ar: 'رياضيات', en: 'Mathematics', icon: Calculator, color: 'Blue' },
    { id: 'history', ar: 'تاريخ', en: 'History', icon: History, color: 'Orange' },
    { id: 'geography', ar: 'جغرافيا', en: 'Geography', icon: Globe, color: 'Sky' },
    { id: 'philosophy', ar: 'فلسفة', en: 'Philosophy', icon: Lightbulb, color: 'Violet' },
    { id: 'psychology', ar: 'علم نفس', en: 'Psychology', icon: Brain, color: 'Pink' },
    { id: 'other', ar: 'أخرى', en: 'Other', icon: Hexagon, color: 'Slate' },
];

export const COLOR_MAP = {
    Amber: 'from-amber-500/20 to-amber-600/5 text-amber-500 border-amber-500/20 bg-amber-500',
    Indigo: 'from-indigo-500/20 to-indigo-600/5 text-indigo-500 border-indigo-500/20 bg-indigo-500',
    Cyan: 'from-cyan-500/20 to-cyan-600/5 text-cyan-500 border-cyan-500/20 bg-cyan-500',
    Emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-500 border-emerald-500/20 bg-emerald-500',
    Purple: 'from-purple-500/20 to-purple-600/5 text-purple-500 border-purple-500/20 bg-purple-500',
    Rose: 'from-rose-500/20 to-rose-600/5 text-rose-500 border-rose-500/20 bg-rose-500',
    Blue: 'from-blue-500/20 to-blue-600/5 text-blue-500 border-blue-500/20 bg-blue-500',
    Orange: 'from-orange-500/20 to-orange-600/5 text-orange-500 border-orange-500/20 bg-orange-500',
    Sky: 'from-sky-500/20 to-sky-600/5 text-sky-500 border-sky-500/20 bg-sky-500',
    Violet: 'from-violet-500/20 to-violet-600/5 text-violet-500 border-violet-500/20 bg-violet-500',
    Pink: 'from-pink-500/20 to-pink-600/5 text-pink-500 border-pink-500/20 bg-pink-500',
    Slate: 'from-slate-500/20 to-slate-600/5 text-slate-500 border-slate-500/20 bg-slate-500',
};
