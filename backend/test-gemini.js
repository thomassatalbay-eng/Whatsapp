const API_KEY = process.argv[2];

async function run() {
    const payload = {
        contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
    };

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('2.5-flash result:', data);
    
    const res2 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data2 = await res2.json();
    console.log('1.5-flash result:', data2);
}

run();
