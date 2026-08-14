export function getApiBaseUrl(): string {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('CUSTOM_API_URL');
        if (stored) return stored.replace(/\/$/, '');
    }
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl && !envUrl.includes('localhost')) {
        return envUrl.replace(/\/$/, '');
    }
    return 'http://localhost:3001';
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api${endpoint}`;

    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'API Error' }));
            throw new Error(errorData.error || `HTTP ${res.status}`);
        }

        return res.json();
    } catch (err: any) {
        console.error(`[API Error] Failed to fetch ${url}:`, err);
        throw new Error(err.message || 'Network connection failed');
    }
}
