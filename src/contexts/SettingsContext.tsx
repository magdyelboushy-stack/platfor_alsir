import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SystemSettings, settingsService } from '@/features/admin/services/SettingsService';

interface SettingsContextType {
    settings: SystemSettings | null;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const BRANDING = {
        app_name: 'الأكاديمية - السير الشامي',
        primary_color: '#7F1D1D',     // Redish
        secondary_color: '#B45309',   // Amber
        accent_color: '#FCD34D',      // Gold
        logo_url: '/assets/السير_الشامي/594930133_1456894779774091_6490422839217536606_n.jpg',
        banner_url: '/assets/السير_الشامي/577042863_1456895286440707_6069203572316920901_n.jpg'
    };

    const refreshSettings = async () => {
        try {
            const data = await settingsService.getSettings();
            setSettings(data);
            applyTheme();
            applySiteIdentity();
        } catch (error) {
            console.error('Failed to load settings', error);
            // Even if it fails, apply branding
            applyTheme();
            applySiteIdentity();
        } finally {
            setLoading(false);
        }
    };

    const applyTheme = () => {
        const root = document.documentElement;

        const getRgb = (h: string) => {
            const r = parseInt(h.slice(1, 3), 16);
            const g = parseInt(h.slice(3, 5), 16);
            const b = parseInt(h.slice(5, 7), 16);
            return `${r} ${g} ${b}`;
        };

        const weights = {
            50: 95, 100: 85, 200: 70, 300: 50, 400: 25,
            500: 0, 600: -15, 700: -30, 800: -45, 900: -60, 950: -75
        };

        // Use Hardcoded Colors
        const hex = BRANDING.primary_color;
        Object.entries(weights).forEach(([shade, weight]) => {
            const sHex = weight === 0 ? hex : adjustBrightness(hex, weight);
            root.style.setProperty(`--brand-${shade}`, sHex);
            root.style.setProperty(`--brand-${shade}-rgb`, getRgb(sHex));
        });
        root.style.setProperty('--color-brand', hex);

        const sHex = BRANDING.secondary_color;
        root.style.setProperty('--brand-secondary', sHex);
        root.style.setProperty('--brand-secondary-rgb', getRgb(sHex));
        const darkVariant = adjustBrightness(sHex, -15);
        root.style.setProperty('--brand-700', darkVariant);
        root.style.setProperty('--brand-700-rgb', getRgb(darkVariant));

        const aHex = BRANDING.accent_color;
        root.style.setProperty('--brand-accent', aHex);
        root.style.setProperty('--brand-accent-rgb', getRgb(aHex));
    };

    const applySiteIdentity = () => {
        // Use Hardcoded Identity
        document.title = BRANDING.app_name;

        // Update Favicon
        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (favicon) {
            favicon.href = BRANDING.logo_url;
        } else {
            const newFavicon = document.createElement('link');
            newFavicon.rel = 'icon';
            newFavicon.href = BRANDING.logo_url;
            document.head.appendChild(newFavicon);
        }
    };

    // Helper to darken/lighten hex
    const adjustBrightness = (hex: string, percent: number) => {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = ((num >> 8) & 0x00ff) + amt;
        const B = (num & 0x0000ff) + amt;
        return (
            "#" +
            (0x1000000 +
                (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
                (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
                (B < 255 ? (B < 1 ? 0 : B) : 255)
            )
                .toString(16)
                .slice(1)
        );
    };

    useEffect(() => {
        refreshSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
