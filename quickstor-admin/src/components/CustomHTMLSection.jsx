/**
 * CustomHTMLSection Component
 * Renders AI-generated custom HTML sections
 */

import React from 'react';

const CustomHTMLSection = ({ html, className = '' }) => {
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
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};

export default CustomHTMLSection;
