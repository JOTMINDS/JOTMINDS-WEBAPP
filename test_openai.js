fetch("https://4b7ca5d9.jotminds.pages.dev/api/openai", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert.' },
      { role: 'user', content: 'Return {"status": "ok"} in JSON format.' }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 800
  })
}).then(r => r.json()).then(d => {
  console.log(JSON.stringify(d, null, 2));
  console.log("CONTENT:", d.choices?.[0]?.message?.content);
  console.log("PARSED:", JSON.parse(d.choices?.[0]?.message?.content));
}).catch(console.error);
