import React, { useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

const CustomHTMLSection = ({ html, css, js, content }) => {

    // Clean up content to prevent "undefined" strings
    const cleanHtml = html || '';
    const cleanCss = css || '';
    // JS execution is unsafe in frontend without strict sandboxing, skipping for MVP security. 
    // If needed, we must use a sandboxed iframe or strict CSP. 
    // For now, we only render HTML/CSS.

    // Parse HTML and inject content if provided
    const processedHtml = useMemo(() => {
        let result = cleanHtml;
        if (content && typeof content === 'object') {
            Object.entries(content).forEach(([key, value]) => {
                // Simple {{key}} replacement
                result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
            });
        }
        return result;
    }, [cleanHtml, content]);

    return (
        <div className="custom-section-wrapper">
            {cleanCss && (
                <style dangerouslySetInnerHTML={{ __html: cleanCss }} />
            )}
            <div dangerouslySetInnerHTML={{ __html: processedHtml }} />
        </div>
    );
};

export default CustomHTMLSection;
