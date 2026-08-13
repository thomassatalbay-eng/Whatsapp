import fs from 'fs';
import path from 'path';

export interface AppConfig {
    autoReplyEnabled: boolean;
    systemPrompt: string;
    groqApiKey: string;
    minDelay: number;
    maxDelay: number;
}

export interface ChatMessage {
    id: string;
    phone: string;
    content: string;
    isFromMe: boolean;
    status: 'SENT' | 'RECEIVED' | 'FAILED';
    error?: string | null;
    createdAt: string;
}

const CONFIG_PATH = path.resolve('./config.json');
const MESSAGES_PATH = path.resolve('./messages.json');

const defaultConfig: AppConfig = {
    autoReplyEnabled: true,
    systemPrompt: 'You are an AI assistant for customer support. Be polite, concise, and helpful. Reply in the same language as the customer.',
    groqApiKey: '',
    minDelay: 2,
    maxDelay: 5
};

export const getConfig = (): AppConfig => {
    if (!fs.existsSync(CONFIG_PATH)) {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
    }
    try {
        const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
        return { ...defaultConfig, ...JSON.parse(raw) };
    } catch {
        return defaultConfig;
    }
};

export const updateConfig = (newConfig: Partial<AppConfig>): AppConfig => {
    const current = getConfig();
    const updated = { ...current, ...newConfig };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2));
    return updated;
};

export const getMessages = (): ChatMessage[] => {
    if (!fs.existsSync(MESSAGES_PATH)) {
        return [];
    }
    try {
        const raw = fs.readFileSync(MESSAGES_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
};

export const saveMessage = (msg: Omit<ChatMessage, 'id' | 'createdAt'>): ChatMessage => {
    const messages = getMessages();
    const newMsg: ChatMessage = {
        ...msg,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString()
    };
    messages.push(newMsg);
    // Keep max 500 recent messages
    const trimmed = messages.slice(-500);
    fs.writeFileSync(MESSAGES_PATH, JSON.stringify(trimmed, null, 2));
    return newMsg;
};

export const clearMessagesForPhone = (phone: string): void => {
    const messages = getMessages();
    const filtered = messages.filter(m => m.phone !== phone);
    fs.writeFileSync(MESSAGES_PATH, JSON.stringify(filtered, null, 2));
};
