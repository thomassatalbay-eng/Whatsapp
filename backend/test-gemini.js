const API_KEY = process.argv[2] || 'dummy';

async function testModel(modelName) {
    const payload = {
        contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
    };

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log(`[${modelName}] result:`, data);
}

async function run() {
    await testModel('gemini-2.5-flash-lite');
    await testModel('gemini-3.0-flash');
    await testModel('gemini-3.1-flash');
    await testModel('gemini-3.1-pro');
}

run();
