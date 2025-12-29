/**
 * CustomHTMLSection Component
 * Renders AI-generated custom HTML sections with dynamic content interpolation
 */

import React, { useMemo } from 'react';

const CustomHTMLSection = ({ html, content = {}, className = '' }) => {
    // Interpolate content into HTML
    const finalHtml = useMemo(() => {
        if (!html) return '';
        let processed = html;
        Object.entries(content).forEach(([key, value]) => {
            // Simple replace for {{key}}
            const regex = new RegExp(`{{${key}}}`, 'g');
            processed = processed.replace(regex, value || '');
        });
        return processed;
    }, [html, content]);

    if (!html) {
        return (
            <section className="py-20 bg-[#050505] flex items-center justify-center">
                <p className="text-gray-400">No content available</p>
            </section>
        );
    }

    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{ __html: finalHtml }}
        />
    );
};

export default CustomHTMLSection;
