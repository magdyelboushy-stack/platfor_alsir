import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title: string;
    description?: string;
    keywords?: string[];
    image?: string;
    type?: 'website' | 'article' | 'profile';
    noindex?: boolean;
}

export function SEO({ 
    title, 
    description, 
    keywords = [], 
    image, 
    type = 'website',
    noindex = false
}: SEOProps) {
    const location = useLocation();
    const siteUrl = window.location.origin;
    const currentUrl = `${siteUrl}${location.pathname}`;
    const defaultImage = `${siteUrl}/vite.svg`; // Fallback image
    
    // Default keywords from user requirements
    const defaultKeywords = [
        'منصة تعليمية',
        'كورسات',
        'شرح مواد',
        'امتحانات',
        'مراجعات',
        'تقيمات',
        'اي صف دراسي',
        'كورسات 2 اعدادي',
        '3 اعدادي',
        'اولي اعدادي',
        'pdf 3 اعدادي'
    ];

    const allKeywords = [...defaultKeywords, ...keywords].join(', ');

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={allKeywords} />
            {noindex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image || defaultImage} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={currentUrl} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image || defaultImage} />
            
            {/* Canonical */}
            <link rel="canonical" href={currentUrl} />
        </Helmet>
    );
}
