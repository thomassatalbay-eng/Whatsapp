import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getConfig, updateConfig, getMessages, clearMessagesForPhone } from './config.js';
import { startWhatsApp, logoutWhatsApp, getInstanceStatus, sendMessage } from './whatsapp.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true
}));

app.use(express.json());

// 1. UptimeRobot Health Ping endpoint (Keeps Render awake 24/7 for free!)
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        app: 'Anthrix AI Lite',
        whatsapp: getInstanceStatus().status,
        timestamp: new Date().toISOString()
    });
});

// Simple zero-database text matching login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body || {};
    const validUser = process.env.ADMIN_USERNAME || 'admin';
    const validPass = process.env.ADMIN_PASSWORD || 'afzal123';

    if (username === validUser && password === validPass) {
        return res.json({ success: true, token: 'afzal_auth_token_secured' });
    }
    return res.status(401).json({ success: false, error: 'Invalid username or password' });
});

// 2. WhatsApp Instance endpoints
app.get('/api/instance/status', (_req, res) => {
    res.json(getInstanceStatus());
});

app.post('/api/instance/connect', async (_req, res) => {
    startWhatsApp().catch(console.error);
    res.json({ message: 'Initializing WhatsApp connection...' });
});

app.post('/api/instance/disconnect', async (_req, res) => {
    await logoutWhatsApp();
    res.json({ message: 'Disconnected successfully.' });
});

// 3. Settings endpoints
app.get('/api/settings', (_req, res) => {
    res.json(getConfig());
});

app.post('/api/settings', (req, res) => {
    const updated = updateConfig(req.body);
    res.json(updated);
});

// 4. Chat / Inbox endpoints
app.get('/api/chats', (_req, res) => {
    const messages = getMessages();
    const map = new Map<string, any>();

    // Group messages by phone number to get active conversations
    for (const m of messages) {
        if (!map.has(m.phone) || new Date(m.createdAt) > new Date(map.get(m.phone).createdAt)) {
            map.set(m.phone, m);
        }
    }

    const conversations = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json(conversations);
});

app.get('/api/chats/:phone', (req, res) => {
    const { phone } = req.params;
    const messages = getMessages().filter(m => m.phone === phone);
    res.json(messages);
});

app.post('/api/chats/:phone', async (req, res) => {
    const { phone } = req.params;
    const { content } = req.body;

    if (!content) {
        res.status(400).json({ error: 'Message content is required' });
        return;
    }

    try {
        await sendMessage(phone, content);
        res.json({ message: 'Message sent successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'Failed to send message' });
    }
});

app.delete('/api/chats/:phone', (req, res) => {
    const { phone } = req.params;
    clearMessagesForPhone(phone);
    res.json({ message: 'Chat cleared' });
});

app.listen(PORT, () => {
    console.log(`🚀 Anthrix AI Lite Backend running on http://localhost:${PORT}`);
    console.log(`📡 Health Check endpoint for Render/UptimeRobot: http://localhost:${PORT}/health`);
    
    // Auto-connect WhatsApp on startup if session exists
    startWhatsApp().catch(console.error);
});
