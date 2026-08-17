const API_KEY = process.argv[2] || 'dummy';

async function run() {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://afzalmedicalcomplex.com',
            'X-Title': 'Afzal Medical Complex Bot'
        },
        body: JSON.stringify({
            model: 'qwen/qwen3-8b:free',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Hello, what is your name?' }
            ],
            temperature: 0.4,
            max_tokens: 500
        })
    });

    const data = await response.json();
    console.log('STATUS:', response.status);
    console.log('FULL RESPONSE:', JSON.stringify(data, null, 2));
    console.log('CONTENT:', data.choices?.[0]?.message?.content);
    console.log('REASONING:', data.choices?.[0]?.message?.reasoning);
}

run().catch(console.error);
