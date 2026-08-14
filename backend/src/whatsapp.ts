import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode';
import fs from 'fs';
import { getConfig, getMessages, saveMessage } from './config.js';
import { getAIReply } from './ai.js';

let sock: any = null;
let currentQR: string | null = null;
let instanceStatus: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' = 'DISCONNECTED';
let isInitializing = false;

const logger = (pino as any)({ level: 'silent' });

export const getInstanceStatus = () => ({
    status: instanceStatus,
    qr: currentQR
});

export const startWhatsApp = async (): Promise<void> => {
    if (sock || isInitializing) return;
    isInitializing = true;
    instanceStatus = 'CONNECTING';

    console.log('[WhatsApp Lite] Starting instant Baileys WhatsApp engine...');

    try {
        const { state, saveCreds } = await useMultiFileAuthState('./.baileys_auth');
        const { version } = await fetchLatestBaileysVersion();

        const initWASocket = typeof makeWASocket === 'function' ? makeWASocket : (makeWASocket as any).default;

        sock = initWASocket({
            version,
            logger,
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            generateHighQualityLinkPreview: true,
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update: any) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log('[WhatsApp Lite] 📱 Instant QR Code generated!');
                try {
                    currentQR = await qrcode.toDataURL(qr);
                } catch {
                    currentQR = null;
                }
            }

            if (connection === 'open') {
                console.log('[WhatsApp Lite] ✅ WhatsApp Connected!');
                instanceStatus = 'CONNECTED';
                currentQR = null;
            }

            if (connection === 'close') {
                const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                console.log('[WhatsApp Lite] Connection closed, statusCode:', statusCode);

                sock = null;
                currentQR = null;

                if (shouldReconnect) {
                    instanceStatus = 'CONNECTING';
                    setTimeout(() => startWhatsApp(), 3000);
                } else {
                    instanceStatus = 'DISCONNECTED';
                    if (fs.existsSync('./.baileys_auth')) {
                        try {
                            fs.rmSync('./.baileys_auth', { recursive: true, force: true });
                        } catch {}
                    }
                }
            }
        });

        sock.ev.on('messages.upsert', async (m: any) => {
            if (m.type !== 'notify') return;

            for (const msg of m.messages) {
                if (msg.key.fromMe || !msg.message) continue;

                const remoteJid = msg.key.remoteJid;
                if (!remoteJid || remoteJid.endsWith('@g.us') || remoteJid.endsWith('@broadcast')) continue;

                const text = msg.message.conversation ||
                             msg.message.extendedTextMessage?.text ||
                             msg.message.imageMessage?.caption || '';

                if (!text.trim()) continue;

                // Save incoming message
                saveMessage({
                    phone: remoteJid,
                    content: text,
                    isFromMe: false,
                    status: 'RECEIVED'
                });

                const config = getConfig();

                if (config.autoReplyEnabled && config.groqApiKey) {
                    console.log(`🤖 AI processing message from ${remoteJid}...`);

                    const history = getMessages()
                        .filter(m => m.phone === remoteJid)
                        .slice(-10);

                    const min = config.minDelay || 2;
                    const max = config.maxDelay || 5;
                    const randomDelay = Math.floor(Math.random() * (max - min + 1) + min) * 1000;

                    try {
                        const [reply] = await Promise.all([
                            getAIReply(text, config.systemPrompt, config.groqApiKey, history),
                            new Promise(res => setTimeout(res, randomDelay))
                        ]);

                        await sock.sendMessage(remoteJid, { text: reply });

                        saveMessage({
                            phone: remoteJid,
                            content: reply,
                            isFromMe: true,
                            status: 'SENT'
                        });
                    } catch (err: any) {
                        console.error('[WhatsApp Lite] AI auto-reply error:', err.message);
                        saveMessage({
                            phone: remoteJid,
                            content: '[AI Generation Failed]',
                            isFromMe: true,
                            status: 'FAILED',
                            error: err.message || String(err)
                        });
                    }
                }
            }
        });

    } catch (err) {
        console.error('[WhatsApp Lite] Baileys startup error:', err);
        instanceStatus = 'DISCONNECTED';
        sock = null;
    } finally {
        isInitializing = false;
    }
};

export const logoutWhatsApp = async (): Promise<void> => {
    if (sock) {
        try { await sock.logout(); } catch {}
        try { sock.end(undefined); } catch {}
        sock = null;
    }
    instanceStatus = 'DISCONNECTED';
    currentQR = null;

    if (fs.existsSync('./.baileys_auth')) {
        try {
            fs.rmSync('./.baileys_auth', { recursive: true, force: true });
        } catch {}
    }
};

export const sendMessage = async (phone: string, text: string) => {
    if (!sock || instanceStatus !== 'CONNECTED') {
        throw new Error('WhatsApp is not connected');
    }
    const formattedPhone = phone.includes('@') ? phone : `${phone}@s.whatsapp.net`;
    await sock.sendMessage(formattedPhone, { text });
    saveMessage({
        phone: formattedPhone,
        content: text,
        isFromMe: true,
        status: 'SENT'
    });
};
