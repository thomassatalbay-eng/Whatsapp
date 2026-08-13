import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode';
import fs from 'fs';
import { getConfig, getMessages, saveMessage } from './config.js';
import { getAIReply } from './ai.js';

let client: any = null;
let currentQR: string | null = null;
let instanceStatus: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' = 'DISCONNECTED';
let isInitializing = false;

export const getInstanceStatus = () => ({
    status: instanceStatus,
    qr: currentQR
});

export const startWhatsApp = async (): Promise<void> => {
    if (client || isInitializing) return;
    isInitializing = true;
    instanceStatus = 'CONNECTING';

    console.log('[WhatsApp Lite] Starting single WhatsApp instance...');

    const executablePath = process.platform === 'win32'
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : undefined;

    client = new Client({
        authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
        puppeteer: {
            headless: true,
            executablePath,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        }
    });

    client.on('qr', async (qrStr: string) => {
        console.log('[WhatsApp Lite] 📱 QR Code generated');
        try {
            currentQR = await qrcode.toDataURL(qrStr);
        } catch {
            currentQR = null;
        }
    });

    client.on('ready', () => {
        console.log('[WhatsApp Lite] ✅ WhatsApp is ready and connected!');
        instanceStatus = 'CONNECTED';
        currentQR = null;
    });

    client.on('disconnected', (reason: string) => {
        console.log('[WhatsApp Lite] ⛔ Disconnected:', reason);
        instanceStatus = 'DISCONNECTED';
        currentQR = null;
        client = null;

        if (reason === 'NAVIGATION' || reason === 'LOGOUT') {
            const sessionPath = './.wwebjs_auth';
            setTimeout(() => {
                if (fs.existsSync(sessionPath)) {
                    try {
                        fs.rmSync(sessionPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 1000 });
                    } catch { /* ignore non-fatal lock */ }
                }
            }, 1500);
        }
    });

    client.on('message', async (msg: any) => {
        if (msg.isStatus || msg.from.includes('@g.us')) return;

        const phone = msg.from;
        const text = msg.body;
        if (!text) return;

        // Save incoming message
        saveMessage({
            phone,
            content: text,
            isFromMe: false,
            status: 'RECEIVED'
        });

        const config = getConfig();

        if (config.autoReplyEnabled && config.groqApiKey) {
            console.log(`🤖 AI processing message from ${phone}...`);

            const history = getMessages()
                .filter(m => m.phone === phone)
                .slice(-10);

            const min = config.minDelay || 2;
            const max = config.maxDelay || 5;
            const randomDelay = Math.floor(Math.random() * (max - min + 1) + min) * 1000;

            try {
                const [reply] = await Promise.all([
                    getAIReply(text, config.systemPrompt, config.groqApiKey, history),
                    new Promise(res => setTimeout(res, randomDelay))
                ]);

                // Direct reply to message
                await msg.reply(reply);

                saveMessage({
                    phone,
                    content: reply,
                    isFromMe: true,
                    status: 'SENT'
                });
            } catch (err: any) {
                console.error('[WhatsApp Lite] AI auto-reply error:', err.message);
                saveMessage({
                    phone,
                    content: '[AI Generation Failed]',
                    isFromMe: true,
                    status: 'FAILED',
                    error: err.message || String(err)
                });
            }
        }
    });

    try {
        await client.initialize();
    } catch (err) {
        console.error('[WhatsApp Lite] Initialization error:', err);
        instanceStatus = 'DISCONNECTED';
        client = null;
    } finally {
        isInitializing = false;
    }
};

export const logoutWhatsApp = async (): Promise<void> => {
    if (client) {
        try { await client.logout(); } catch {}
        try { await client.destroy(); } catch {}
        client = null;
    }
    instanceStatus = 'DISCONNECTED';
    currentQR = null;

    const sessionPath = './.wwebjs_auth';
    setTimeout(() => {
        if (fs.existsSync(sessionPath)) {
            try {
                fs.rmSync(sessionPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 1000 });
            } catch {}
        }
    }, 1500);
};

export const sendMessage = async (phone: string, text: string) => {
    if (!client || instanceStatus !== 'CONNECTED') {
        throw new Error('WhatsApp is not connected');
    }
    await client.sendMessage(phone, text);
    saveMessage({
        phone,
        content: text,
        isFromMe: true,
        status: 'SENT'
    });
};
