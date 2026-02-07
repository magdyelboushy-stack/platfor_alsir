/**
 * ThemeService - Database-Driven Theming System
 * Implements Singleton Pattern (SOLID: Single Responsibility)
 * 
 * Injects CSS variables from API into :root for global theming
 */

import axios from 'axios';

export interface ThemeColors {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    primaryRgb: string;
}

const DEFAULT_THEME: ThemeColors = {
    primaryColor: '#0d9488',  // Teal 600
    secondaryColor: '#f59e0b', // Amber 500
    accentColor: '#fcd34d',    // Amber 300
    primaryRgb: '13 148 136',
};

class ThemeService {
    private static instance: ThemeService;
    private currentTheme: ThemeColors = DEFAULT_THEME;

    private constructor() { }

    public static getInstance(): ThemeService {
        if (!ThemeService.instance) {
            ThemeService.instance = new ThemeService();
        }
        return ThemeService.instance;
    }

    /**
     * Fetch theme from API and apply to DOM
     */
    public async loadFromAPI(): Promise<ThemeColors> {
        try {
            const response = await axios.get('/api/theme');
            if (response.data) {
                this.applyTheme(response.data);
                return response.data;
            }
        } catch (error) {
            console.warn('ThemeService: Using default theme (API unavailable)');
        }
        this.applyTheme(DEFAULT_THEME);
        return DEFAULT_THEME;
    }

    /**
     * Apply theme colors to CSS variables
     */
    public applyTheme(colors: Partial<ThemeColors>): void {
        const root = document.documentElement;

        if (colors.primaryColor) {
            root.style.setProperty('--brand-500', colors.primaryColor);
            root.style.setProperty('--brand-primary', colors.primaryColor);
            root.style.setProperty('--color-brand', colors.primaryColor);
        }

        if (colors.primaryRgb) {
            root.style.setProperty('--brand-500-rgb', colors.primaryRgb);
        }

        if (colors.secondaryColor) {
            root.style.setProperty('--brand-secondary', colors.secondaryColor);
        }

        if (colors.accentColor) {
            root.style.setProperty('--brand-accent', colors.accentColor);
        }

        this.currentTheme = { ...this.currentTheme, ...colors };
    }

    /**
     * Convert HEX to RGB string for opacity support
     */
    public hexToRgb(hex: string): string {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
        }
        return '13 148 136'; // Default teal
    }

    /**
     * Get current theme
     */
    public getTheme(): ThemeColors {
        return this.currentTheme;
    }
}

export const themeService = ThemeService.getInstance();
export default ThemeService;
