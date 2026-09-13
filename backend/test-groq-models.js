const API_KEY = process.argv[2];

async function run() {
    if (!API_KEY) {
        console.log('Usage: node test-groq-models.js <groq_api_key>');
        return;
    }

    console.log('1. Querying active models from Groq...');
    try {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        const data = await res.json();
        if (data.data) {
            console.log('Available Groq models on your account:');
            const modelIds = data.data.map(m => m.id);
            modelIds.forEach(id => console.log('  •', id));

            // Test first matching candidate
            const candidates = [
                'openai/gpt-oss-120b',
                'gpt-oss-120b',
                'openai/gpt-oss-20b',
                'gpt-oss-20b',
                'qwen/qwen-3.8-27b',
                'qwen-3.8-27b',
                'qwen/qwen-3.6-27b',
                'qwen-3.6-27b',
                'groq/compound',
                'groq-compound'
            ];

            const chosen = candidates.find(c => modelIds.includes(c)) || modelIds[0];
            console.log(`\n2. Testing chat completion with: ${chosen}...`);

            const chatRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: chosen,
                    messages: [
                        { role: 'system', content: 'You are an AI assistant.' },
                        { role: 'user', content: 'Hello! Respond with one sentence.' }
                    ]
                })
            });

            const chatData = await chatRes.json();
            console.log('Chat status:', chatRes.status);
            console.log('Chat reply:', chatData.choices?.[0]?.message?.content || chatData);
        } else {
            console.log('Response:', data);
        }
    } catch (e) {
        console.error(e);
    }
}

run();
