const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE_URL}/api${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'API Error' }));
        throw new Error(errorData.error || `HTTP error ${res.status}`);
    }

    return res.json();
}
