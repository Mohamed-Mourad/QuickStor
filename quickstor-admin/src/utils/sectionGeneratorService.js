/**
 * Section Generator Service
 * Generates and iteratively edits HTML sections using Gemini AI
 */

import { callGeminiAPI, callGeminiAPIWithHistory } from './geminiService';
import { getSectionGenerationPrompt, getAIPromptPrefix } from './styleContext';

/**
 * Generate a section HTML from a user prompt (initial generation)
 * @param {string} userPrompt - The user's description of what they want
 * @returns {Promise<{html: string, error: string|null}>}
 */
export async function generateSectionHTML(userPrompt) {
    try {
        const prompt = getSectionGenerationPrompt(userPrompt);
        const response = await callGeminiAPI(prompt);

        // Clean up the response - remove markdown code blocks if present
        let html = response.trim();
        html = html.replace(/^```(?:html)?\s*/i, '');
        html = html.replace(/\s*```$/i, '');

        // Validate it starts with HTML
        if (!html.startsWith('<')) {
            const htmlMatch = html.match(/<section[\s\S]*<\/section>/i);
            if (htmlMatch) {
                html = htmlMatch[0];
            } else {
                throw new Error('AI did not return valid HTML. Please try rephrasing your prompt.');
            }
        }

        return { html, error: null };
    } catch (error) {
        console.error('Section generation error:', error);
        return {
            html: null,
            error: error.message || 'Failed to generate section. Please try again.'
        };
    }
}

/**
 * Edit an existing section based on chat history
 * @param {Array} chatHistory - Array of {role: 'user'|'model', content: string}
 * @param {string} currentHTML - The current HTML of the section
 * @param {string} editRequest - The user's edit request
 * @returns {Promise<{html: string, error: string|null}>}
 */
export async function editSectionWithChat(chatHistory, currentHTML, editRequest) {
    try {
        // Build the conversation for Gemini
        const systemContext = `${getAIPromptPrefix()}

## CURRENT HTML
The user has the following section that they want to edit:
\`\`\`html
${currentHTML}
\`\`\`

## CONVERSATION CONTEXT
You are helping the user iteratively improve this section. Respond with the COMPLETE updated HTML code only, no explanations.
- If the request is a small change, modify only the relevant parts
- Always return the full section HTML
- Keep all the styling consistent with the design system`;

        // Build messages array for multi-turn conversation
        const messages = [
            { role: 'user', text: systemContext }
        ];

        // Add chat history
        chatHistory.forEach(msg => {
            messages.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                text: msg.content
            });
        });

        // Add the new edit request
        messages.push({
            role: 'user',
            text: `Edit request: ${editRequest}\n\nRespond with the complete updated HTML only:`
        });

        const response = await callGeminiAPIWithHistory(messages);

        // Clean up the response
        let html = response.trim();
        html = html.replace(/^```(?:html)?\s*/i, '');
        html = html.replace(/\s*```$/i, '');

        // Try to extract section if response has extra text
        if (!html.startsWith('<')) {
            const htmlMatch = html.match(/<section[\s\S]*<\/section>/i);
            if (htmlMatch) {
                html = htmlMatch[0];
            } else {
                // Try to find any HTML
                const anyHtmlMatch = html.match(/<[a-z][\s\S]*>/i);
                if (anyHtmlMatch) {
                    html = anyHtmlMatch[0];
                } else {
                    throw new Error('AI did not return valid HTML. Please try rephrasing your request.');
                }
            }
        }

        return { html, error: null };
    } catch (error) {
        console.error('Section edit error:', error);
        return {
            html: null,
            error: error.message || 'Failed to edit section. Please try again.'
        };
    }
}

/**
 * Save a generated section to local storage library
 */
export function saveToLibrary(section) {
    const library = JSON.parse(localStorage.getItem('quickstor_custom_sections') || '[]');

    const newSection = {
        id: `custom-${Date.now()}`,
        name: section.name || 'Custom Section',
        type: 'CUSTOM_HTML',
        html: section.html,
        prompt: section.prompt,
        createdAt: new Date().toISOString()
    };

    library.push(newSection);
    localStorage.setItem('quickstor_custom_sections', JSON.stringify(library));

    return newSection;
}

/**
 * Get all custom sections from library
 */
export function getCustomSections() {
    return JSON.parse(localStorage.getItem('quickstor_custom_sections') || '[]');
}

/**
 * Delete a custom section from library
 */
export function deleteFromLibrary(sectionId) {
    const library = getCustomSections();
    const filtered = library.filter(s => s.id !== sectionId);
    localStorage.setItem('quickstor_custom_sections', JSON.stringify(filtered));
}
