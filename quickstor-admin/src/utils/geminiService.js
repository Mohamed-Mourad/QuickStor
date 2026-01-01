/**
 * Gemini AI Service
 * Handles API calls to Google's Gemini for intelligent data extraction
 * Includes retry logic and fallback CSV parsing
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 2000;

/**
 * Sleep helper
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Call Gemini API with a prompt and get a text response
 * Non-streaming fallback
 */
export async function callGeminiAPI(prompt) {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
    }

    let lastError;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.2,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 4096,
                    }
                })
            });

            if (response.status === 429 || response.status === 503) {
                const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
                console.log(`Rate limited. Retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
                await sleep(delay);
                continue;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error('No response generated from Gemini API');
            }

            return text;
        } catch (error) {
            lastError = error;
            if (attempt < MAX_RETRIES - 1 && error.message?.includes('429')) {
                const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
                await sleep(delay);
                continue;
            }
        }
    }

    throw lastError || new Error('Failed after multiple retries');
}



/**
 * Call Gemini API with a prompt and stream the response
 * @param {string} prompt - The full prompt to send
 * @param {function(string): void} onChunk - Callback for each text chunk
 * @returns {Promise<string>} - The full generated text response
 */
export async function callGeminiAPIStream(prompt, onChunk) {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured.');
    }

    const STREAM_URL = GEMINI_API_URL.replace('generateContent', 'streamGenerateContent');
    let fullText = '';

    try {
        const response = await fetch(`${STREAM_URL}?key=${GEMINI_API_KEY}&alt=sse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.2,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 4096,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const jsonStr = line.substring(6); // Remove 'data: '
                        const data = JSON.parse(jsonStr);
                        const textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text;

                        if (textChunk) {
                            fullText += textChunk;
                            if (onChunk) onChunk(textChunk, fullText);
                        }
                    } catch (e) {
                        // Ignore parse errors for incomplete chunks or "data: [DONE]"
                    }
                }
            }
        }

        if (!fullText) {
            throw new Error('No response generated from Gemini API');
        }

        return fullText;

    } catch (error) {
        console.error('Streaming error:', error);
        // Fallback to non-streaming if streaming fails
        return callGeminiAPI(prompt);
    }
}

/**
 * Call Gemini API with a prompt and get a text response
// ... existing callGeminiAPI code ...
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
    }

    let lastError;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.2,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 4096,
                    }
                })
            });

            if (response.status === 429 || response.status === 503) {
                const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
                console.log(`Rate limited. Retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
                await sleep(delay);
                continue;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error('No response generated from Gemini API');
            }

            return text;
        } catch (error) {
            lastError = error;
            if (attempt < MAX_RETRIES - 1 && error.message?.includes('429')) {
                const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
                await sleep(delay);
                continue;
            }
        }
    }

    throw lastError || new Error('Failed after multiple retries');
}

/**
 * Call Gemini API with conversation history for multi-turn chat (Streaming)
 * @param {Array} messages - Array of {role: 'user'|'model', text: string}
 * @param {function(string, string): void} onChunk - Callback(chunk, fullText)
 * @returns {Promise<string>} - The full generated text response
 */
export async function callGeminiAPIWithHistoryStream(messages, onChunk) {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured.');
    }

    const STREAM_URL = GEMINI_API_URL.replace('generateContent', 'streamGenerateContent');
    const contents = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    let fullText = '';

    try {
        const response = await fetch(`${STREAM_URL}?key=${GEMINI_API_KEY}&alt=sse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    temperature: 0.2,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 4096,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const jsonStr = line.substring(6);
                        const data = JSON.parse(jsonStr);
                        const textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text;

                        if (textChunk) {
                            fullText += textChunk;
                            if (onChunk) onChunk(textChunk, fullText);
                        }
                    } catch (e) {
                        // Ignore
                    }
                }
            }
        }

        return fullText;
    } catch (error) {
        console.error('Streaming error:', error);
        // Fallback
        return callGeminiAPIWithHistory(messages);
    }
}

/**
 * Call Gemini API with conversation history for multi-turn chat
 * @param {Array} messages - Array of {role: 'user'|'model', text: string}
 * @returns {Promise<string>} - The generated text response
 */
export async function callGeminiAPIWithHistory(messages) {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
    }

    // Convert messages to Gemini format
    const contents = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    let lastError;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents,
                    generationConfig: {
                        temperature: 0.3,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 4096,
                    }
                })
            });

            if (response.status === 429 || response.status === 503) {
                const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
                await sleep(delay);
                continue;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error('No response generated from Gemini API');
            }

            return text;
        } catch (error) {
            lastError = error;
            if (attempt < MAX_RETRIES - 1 && error.message?.includes('429')) {
                const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
                await sleep(delay);
                continue;
            }
        }
    }

    throw lastError || new Error('Failed after multiple retries');
}

/**
 * Extract JSON from a Gemini response (handles markdown code blocks)
 */
export function extractJSONFromResponse(text) {
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
        return JSON.parse(codeBlockMatch[1].trim());
    }

    const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
    }

    throw new Error('Could not extract valid JSON from AI response');
}

/**
 * Fallback CSV parser when AI is unavailable
 */
export function parseCSVFallback(csvText, sectionType) {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) {
        throw new Error('File must contain a header row and at least one data row.');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]+/g, ''));
    const dataRows = lines.slice(1);

    const parsedData = dataRows.map(line => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(val => val.trim().replace(/^"|"$/g, ''));
        const obj = {};
        headers.forEach((header, i) => {
            obj[header] = values[i];
        });
        return obj;
    });

    if (sectionType === 'COMPARISON_GRAPH') {
        return parsedData.map(row => ({
            name: row.name || 'Unknown',
            iops: parseInt(row.iops) || 0,
            throughput: parseInt(row.throughput) || 0
        }));
    } else if (sectionType === 'FEATURE_GRID') {
        return parsedData.map(row => ({
            icon: row.icon || 'Star',
            title: row.title || 'Untitled Feature',
            description: row.description || ''
        }));
    }

    throw new Error('Unsupported section type for CSV fallback');
}

/**
 * Main function to extract data from file content using AI
 * Falls back to CSV parsing if AI fails
 */
export async function extractDataWithAI(fileContent, sectionOrType, getPrompt) {
    const sectionType = typeof sectionOrType === 'object' ? sectionOrType.type : sectionOrType;

    try {
        const prompt = getPrompt(sectionOrType, fileContent);
        const response = await callGeminiAPI(prompt);
        const extractedData = extractJSONFromResponse(response);
        return { data: extractedData, method: 'ai' };
    } catch (aiError) {
        console.warn('AI extraction failed, trying CSV fallback:', aiError.message);

        // Try CSV fallback
        try {
            const csvData = parseCSVFallback(fileContent, sectionType);
            return { data: csvData, method: 'csv' };
        } catch (csvError) {
            // Both methods failed - throw a helpful error
            throw new Error(
                `AI extraction failed: ${aiError.message}\n\n` +
                `CSV fallback also failed: ${csvError.message}\n\n` +
                `Tip: For CSV format, use headers: name,iops,throughput (for graphs) or icon,title,description (for features)`
            );
        }
    }
}

/**
 * Generate content for a specific section based on user prompt
 */
export async function generateSectionContent(sectionType, userPrompt, currentContent = {}) {
    let schemaDescription = '';
    let exampleJSON = '';

    // Define schemas based on section type
    switch (sectionType) {
        case 'HERO':
            schemaDescription = `
            - badge: Short text for a badge (e.g., "New Feature")
            - title: { line1: "Main headline", highlight: "Highlighted word" }
            - subtitle: Descriptive text (1-2 sentences)
            - primaryCta: Text for primary button
            - secondaryCta: Text for secondary button
            `;
            exampleJSON = `{
                "badge": "2.0 Release",
                "title": { "line1": "Future of", "highlight": "Storage" },
                "subtitle": "Experience lightning fast data transfer.",
                "primaryCta": "Get Started",
                "secondaryCta": "Learn More"
            }`;
            break;
        case 'FEATURE_GRID':
            schemaDescription = `
            - features: Array of objects, each with:
              - icon: Icon name (one of: Star, Shield, Zap, Cloud, Server, Database, Lock, Globe, Smartphone, Laptop)
              - title: Short feature title
              - description: Feature description
            `;
            exampleJSON = `{
                "features": [
                    { "icon": "Zap", "title": "Fast", "description": "Super fast speed." },
                    { "icon": "Shield", "title": "Secure", "description": "Bank-grade security." }
                ]
            }`;
            break;
        case 'COMPARISON_GRAPH':
            schemaDescription = `
            - title: Graph section title
            - description: Detailed explanation of the comparison
            - data: Array of objects with:
              - name: Product/Competitor name
              - iops: Number (integer)
              - throughput: Number (integer)
            `;
            exampleJSON = `{
                "title": "Performance Comparison",
                "description": "See how we stack up.",
                "data": [
                    { "name": "Us", "iops": 50000, "throughput": 1200 },
                    { "name": "Them", "iops": 10000, "throughput": 500 }
                ]
            }`;
            break;
        case 'CUSTOM_HTML':
            schemaDescription = `
            A JSON object with keys matching the section's content fields.
            Common fields might include title, subtitle, image_url, etc.
            `;
            exampleJSON = `{ "title": "Custom Section", "description": "Generated content" }`;
            break;
        default:
            throw new Error(`Unsupported section type for AI generation: ${sectionType}`);
    }

    const systemPrompt = `
    You are a professional UX copywriter and web designer.
    Generate JSON content for a website section of type: ${sectionType}.
    
    The user wants content about: "${userPrompt}"
    
    Strictly follow this JSON structure:
    ${schemaDescription}
    
    Return ONLY raw JSON. No markdown formatting. No backticks.
    Example format:
    ${exampleJSON}
    `;

    try {
        const response = await callGeminiAPI(systemPrompt);
        return extractJSONFromResponse(response);
    } catch (error) {
        console.error('AI Generation Failed:', error);
        throw new Error('Failed to generate content. Please try a different prompt.');
    }
}
