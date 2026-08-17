import Groq from 'groq-sdk';
import { ChatMessage } from './config.js';

export const getAIReply = async (
    text: string,
    systemPrompt: string,
    aiProvider: 'groq' | 'gemini' | 'openrouter',
    apiKey: string, // groq primary key
    history: ChatMessage[] = [],
    backupApiKey?: string,
    backupApiKey2?: string,
    geminiApiKey?: string,
    openRouterApiKey?: string
): Promise<string> => {
    
    if (aiProvider === 'gemini') {
        if (!geminiApiKey) {
            throw new Error('Gemini API Key is missing. Please set it at /api-key.');
        }

        const combinedHistory: any[] = [];
        let currentRole = '';
        let currentText = '';

        for (const m of history) {
            const role = m.isFromMe ? 'model' : 'user';
            if (role === currentRole) {
                currentText += '\n\n' + m.content;
            } else {
                if (currentRole) {
                    combinedHistory.push({ role: currentRole, parts: [{ text: currentText }] });
                }
                currentRole = role;
                currentText = m.content;
            }
        }
        if (currentRole) {
            combinedHistory.push({ role: currentRole, parts: [{ text: currentText }] });
        }

        if (combinedHistory.length > 0 && combinedHistory[combinedHistory.length - 1].role === 'user') {
            combinedHistory[combinedHistory.length - 1].parts[0].text += '\n\n' + text;
        } else {
            combinedHistory.push({ role: 'user', parts: [{ text }] });
        }

        const contents = combinedHistory;

        const payload = {
            system_instruction: {
                parts: [{ text: systemPrompt }]
            },
            contents,
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 4096
            }
        };

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('[AI Engine] Gemini API Error:', errorData);
                throw new Error(errorData?.error?.message || 'Gemini API failed');
            }

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";
        } catch (err: any) {
            console.error('[AI Engine] Gemini Request Failed:', err.message || err);
            throw err;
        }
    }

    // OpenRouter / Qwen3 logic
    if (aiProvider === 'openrouter') {
        if (!openRouterApiKey) {
            throw new Error('OpenRouter API Key is missing. Please set it at /api-key.');
        }

        const formattedHistory = history.map(m => ({
            role: m.isFromMe ? 'assistant' : 'user',
            content: m.content
        }));

        const messages = [
            { role: 'system', content: systemPrompt },
            ...formattedHistory,
            { role: 'user', content: text }
        ];

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openRouterApiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://afzalmedicalcomplex.com',
                    'X-Title': 'Afzal Medical Complex Bot'
                },
                body: JSON.stringify({
                    model: 'qwen/qwen3-8b:free',
                    messages,
                    temperature: 0.4,
                    max_tokens: 4096,
                    thinking: { type: 'disabled' }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('[AI Engine] OpenRouter API Error:', errorData);
                throw new Error(errorData?.error?.message || 'OpenRouter API failed');
            }

            const data = await response.json();
            console.log('[OpenRouter] Raw response:', JSON.stringify(data?.choices?.[0]?.message));

            let content = data.choices?.[0]?.message?.content || '';
            const reasoning = data.choices?.[0]?.message?.reasoning || '';

            // Qwen3 sometimes wraps answer in <think>...</think> blocks
            // Strip all <think>...</think> sections to get the real answer
            content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

            // If content is empty after stripping, fall back to reasoning field
            if (!content && reasoning) {
                content = reasoning.trim();
            }

            return content || "I'm sorry, I couldn't generate a response.";
        } catch (err: any) {
            console.error('[AI Engine] OpenRouter Request Failed:', err.message || err);
            throw err;
        }
    }

    // Groq logic
    const keys = [apiKey, backupApiKey, backupApiKey2].filter(Boolean) as string[];

    if (keys.length === 0) {
        throw new Error('Groq API Key is missing. Please set it at /api-key.');
    }

    let lastError: any = null;

    for (let i = 0; i < keys.length; i++) {
        const currentKey = keys[i];
        try {
            const groq = new Groq({ apiKey: currentKey });

            const formattedHistory = history.map(m => ({
                role: m.isFromMe ? ('assistant' as const) : ('user' as const),
                content: m.content
            }));

            const messages = [
                { role: 'system' as const, content: systemPrompt },
                ...formattedHistory,
                { role: 'user' as const, content: text }
            ];

            const completion = await groq.chat.completions.create({
                messages,
                model: 'llama-3.3-70b-versatile',
                temperature: 0.4,
                max_tokens: 4096,
            });

            return completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
        } catch (err: any) {
            console.warn(`[AI Engine] API Key #${i + 1} failed or hit daily rate limit:`, err.message || err);
            lastError = err;
            if (i < keys.length - 1) {
                console.log(`[AI Engine] 🔄 Automatically failing over to Backup API Key #${i + 2}...`);
            }
        }
    }

    throw lastError || new Error('All Groq API Keys failed.');
};
