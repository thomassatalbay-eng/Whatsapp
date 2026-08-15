import Groq from 'groq-sdk';
import { ChatMessage } from './config.js';

export const getAIReply = async (
    text: string,
    systemPrompt: string,
    apiKey: string,
    history: ChatMessage[] = [],
    backupApiKey?: string
): Promise<string> => {
    const keys = [apiKey, backupApiKey].filter(Boolean) as string[];

    if (keys.length === 0) {
        throw new Error('LLM API Key is missing. Please set it at /api-key.');
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
                max_tokens: 1024,
            });

            return completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
        } catch (err: any) {
            console.warn(`[AI Engine] API Key #${i + 1} failed or hit daily rate limit:`, err.message || err);
            lastError = err;
            if (i < keys.length - 1) {
                console.log(`[AI Engine] 🔄 Automatically failing over to Backup API Key...`);
            }
        }
    }

    throw lastError || new Error('All API Keys failed.');
};
