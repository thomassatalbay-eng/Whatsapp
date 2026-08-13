import Groq from 'groq-sdk';
import { ChatMessage } from './config.js';

export const getAIReply = async (
    text: string,
    systemPrompt: string,
    apiKey: string,
    history: ChatMessage[] = []
): Promise<string> => {
    if (!apiKey) {
        throw new Error('LLM API Key is missing. Please set it in Settings.');
    }

    const groq = new Groq({ apiKey });

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
};
