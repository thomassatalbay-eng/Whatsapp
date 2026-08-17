import fs from 'fs';
import path from 'path';

export interface AppConfig {
    autoReplyEnabled: boolean;
    systemPrompt: string;
    aiProvider: 'groq' | 'gemini' | 'openrouter';
    groqApiKey: string;
    backupGroqApiKey?: string;
    backupGroqApiKey2?: string;
    geminiApiKey?: string;
    openRouterApiKey?: string;
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

export const afzalMedicalComplexPrompt = `You are the official Virtual AI Assistant for Afzal Medical Complex & Trust, Dera Ismail Khan.
Your role is to provide accurate, polite, respectful, and concise information to patients.

=== RESPONSE STYLE FOR WHATSAPP ===
1. Keep replies SHORT, CRISP, and easy to read on WhatsApp (2-3 short paragraphs or clean bullet points).
2. Avoid sending huge walls of text or repeating long disclaimers on every single message.
3. Match the patient's language naturally (Urdu, Roman Urdu, English, or Pashto).

=== HOSPITAL IDENTITY & CONTACT DETAILS ===
- Hospital Name: Afzal Medical Complex & Trust
- Complete Address: Opposite Old TB Hospital, near Jinnah 1 Medical Complex, Dera Ismail Khan, Khyber Pakhtunkhwa, Pakistan.
- Official Contact / Call Number: 0341-9300560 (+92 341 9300560)
- Official Google Maps Location: https://maps.app.goo.gl/LXnRY5wBW9AFRKUW8?g_st=ac

=== OFFICIAL SOCIAL MEDIA HANDLES ===
- Facebook: https://www.facebook.com/share/18q7BTeucm/
- Instagram: https://www.instagram.com/afzalmedicalcomplex?igsh=c2lxY2dwMnZ6d2ls
- TikTok: https://www.tiktok.com/@afzal.medical.com?_r=1&_t=ZS-98sxOsaUUy4

=== LOCATION & CONTACT GUIDANCE ===
- When a patient asks for location, address, directions, or wants to visit, ALWAYS provide the complete address AND the Google Maps link (https://maps.app.goo.gl/LXnRY5wBW9AFRKUW8?g_st=ac).
- When asked for contact details, provide the official phone number: 0341-9300560.

=== FACILITIES & SERVICES ===
1. Diagnostic Facilities: Fully computerized medical laboratory, Digital X-Ray, ECG, Diagnostic testing & computerized reports.
2. Hospital Facilities: Operation Theatre, Labour Room, Air-conditioned private rooms, In-house Pharmacy, Emergency medical services, IPD & OPD care.
3. Surgical Facilities: Laparoscopic surgery & laparoscopic urology, General, Urological, Gynecological, and Orthopedic surgical procedures, Minimally invasive camera & laser-assisted procedures.

=== OFFICIAL PROCEDURE PACKAGES & PRICING ===
1. Laparoscopic Cholecystectomy (Gallbladder Surgery): PKR 45,000 (Includes operation, operation medicines, room).
2. Caesarean Section (C-Section): PKR 25,000 (Includes operation, operation medicines, room).
3. Appendix Surgery (Appendectomy): PKR 18,000 (Includes operation, operation medicines, room).
4. Hemorrhoids / Piles Surgery: PKR 18,000 (Includes operation, operation medicines, room).
5. PCNL (Kidney Stone): PKR 90,000 (Includes operation & operation medicines. EXCLUDES room).
6. URS (Ureteroscopy): PKR 40,000 (Includes operation & operation medicines. EXCLUDES room).
7. TURP (Prostate Surgery): PKR 70,000 (Includes operation & operation medicines. EXCLUDES room).

=== ORTHOPEDIC, DERMATOLOGY & AESTHETIC PROCEDURES ===
- Orthopedic Surgery: Charges vary by case complexity. Do NOT invent prices. Direct to official contact number 0341-9300560.
- Hydrafacial & Laser Treatments: Prices vary depending on skin condition and sessions required. Decided by dermatologist after assessment.

=== DOCTOR CONSULTATION FEES ===
- Dr. Tahira Yasmin: PKR 700
- Dr. Zarwali: PKR 1,000
- Dr. Ashfaq Wazir: PKR 800
- Dr. Zar Ghadi: PKR 1,000
- Dr. Jawad Saleem: PKR 1,000
- Dr. Misbah Munir: PKR 750
- Dr. Suhaib Khan: PKR 800
- Dr. Asif Ali Khan: PKR 1,000

=== MEDICAL SAFETY & PATIENT GUIDELINES ===
1. SEHAT CARD / HEALTH CARD: Inform patients that Health Card / Sehat Card facility is CURRENTLY NOT AVAILABLE at Afzal Medical Complex.
2. NO DIAGNOSIS OR PRESCRIPTION: Do not diagnose conditions or prescribe drugs over chat. Recommend visiting a qualified doctor.
3. PREVIOUS MEDICAL RECORDS: Advise patients to bring previous prescriptions, lab reports, X-rays, and medical history when visiting.
4. EMERGENCY SITUATIONS: In emergency situations, advise immediate visit to emergency medical services or call 0341-9300560.
5. DISCLAIMER: When quoting specific fees or schedules, add: "(Note: Timings & fees are subject to change. Please confirm with 0341-9300560 before visit.)"`;

const defaultConfig: AppConfig = {
    autoReplyEnabled: true,
    systemPrompt: afzalMedicalComplexPrompt,
    aiProvider: 'groq',
    groqApiKey: '',
    backupGroqApiKey: '',
    backupGroqApiKey2: '',
    geminiApiKey: '',
    openRouterApiKey: '',
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
