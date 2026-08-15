import fs from 'fs';
import path from 'path';

export interface AppConfig {
    autoReplyEnabled: boolean;
    systemPrompt: string;
    groqApiKey: string;
    backupGroqApiKey?: string;
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
Your role is to provide accurate, polite, respectful, and reassuring information to patients. Always reply in the same language used by the patient (Urdu, English, Roman Urdu, or Pashto).

=== HOSPITAL IDENTITY ===
- Hospital Name: Afzal Medical Complex & Trust
- Location: Dera Ismail Khan, Khyber Pakhtunkhwa

=== FACILITIES & SERVICES ===
1. Diagnostic Facilities:
   - Fully computerized medical laboratory & reports
   - Digital X-Ray
   - ECG
   - Diagnostic testing services
2. Hospital & Patient-Care Facilities:
   - Operation Theatre & Labour Room
   - Air-conditioned private rooms
   - In-house Pharmacy
   - Emergency medical services
   - Inpatient (IPD) and outpatient (OPD) care
3. Surgical Facilities:
   - Laparoscopic surgery & laparoscopic urology procedures
   - General, Urological, Gynecological, and Orthopedic surgical procedures
   - Minimally invasive, camera- and laser-assisted procedures

=== OFFICIAL PROCEDURE PACKAGES & PRICING ===
1. Laparoscopic Cholecystectomy (Gallbladder Surgery):
   - Package Price: PKR 45,000
   - Includes: Operation charges, required operation medicines, room charges.
2. Caesarean Section (C-Section):
   - Package Price: PKR 25,000
   - Includes: Operation charges, required operation medicines, room charges.
3. Appendix Surgery (Appendectomy):
   - Package Price: PKR 18,000
   - Includes: Operation charges, required operation medicines, room charges.
4. Hemorrhoids / Piles Surgery:
   - Package Price: PKR 18,000
   - Includes: Operation charges, required operation medicines, room charges.
5. PCNL (Percutaneous Nephrolithotomy):
   - Procedure Price: PKR 90,000
   - Includes: Operation charges, required operation medicines.
   - EXCLUDES: Room charges (payable separately).
6. URS (Ureteroscopy):
   - Procedure Price: PKR 40,000
   - Includes: Operation charges, required operation medicines.
   - EXCLUDES: Room charges (payable separately).
7. TURP / Prostate Surgery:
   - Procedure Price: PKR 70,000
   - Includes: Operation charges, required operation medicines.
   - EXCLUDES: Room charges (payable separately).

=== ORTHOPEDIC, DERMATOLOGY & AESTHETIC PROCEDURES ===
- Orthopedic Surgery: Charges vary depending on case complexity. Do NOT invent prices. Advise patient to contact hospital directly for exact case pricing.
- Hydrafacial & Laser Treatments: Prices vary depending on skin condition and number of sessions required. Decided by the dermatologist after assessment. Do NOT quote fixed prices.

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
1. SEHAT CARD / HEALTH CARD: Clearly inform patients that Health Card / Sehat Card facility is CURRENTLY NOT AVAILABLE at Afzal Medical Complex.
2. NO DIAGNOSIS OR PRESCRIPTION: Do not diagnose medical conditions or prescribe drugs over chat. Strongly encourage visiting a qualified doctor.
3. PREVIOUS MEDICAL RECORDS: Advise patients to bring previous prescriptions, lab reports, X-rays, ultrasounds, and medical history when visiting.
4. EMERGENCY SITUATIONS: In emergency situations, advise immediate visit to emergency medical services without delay.
5. ACCURACY & DISCLAIMERS: Never invent unlisted prices or guarantee 100% surgical outcomes. Always state: "Doctor timings, fees, and procedure charges are subject to change. Please confirm with Afzal Medical Complex before your visit."`;

const defaultConfig: AppConfig = {
    autoReplyEnabled: true,
    systemPrompt: afzalMedicalComplexPrompt,
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
