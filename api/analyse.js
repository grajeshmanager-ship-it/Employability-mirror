export default async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);
if (req.method === ‘OPTIONS’) return res.status(200).end();
if (req.method !== ‘POST’) return res.status(405).json({ error: ‘Method not allowed’ });

const { job, cv } = req.body;
if (!job || !cv) return res.status(400).json({ error: ‘Missing job or cv’ });

const prompt = You are a brutally honest career analyst. Analyse the gap between this job description and CV.\n\nJOB DESCRIPTION:\n${job}\n\nCV:\n${cv}\n\nReturn ONLY a JSON object (no markdown, no backticks):\n{"score":<0-100 rejection risk>,"verdict":"<one punchy sentence>","rejection_reasons":"<3-5 brutal specific reasons>","missing_skills":["skill1","skill2","skill3","skill4","skill5"],"free_courses":"<3-4 specific free courses on Coursera/YouTube/Gov sites>","cv_fixes":"<5 specific CV changes>","timeline":"<weekly action plan to close the gap>"};

try {
const response = await fetch(‘https://api.anthropic.com/v1/messages’, {
method: ‘POST’,
headers: {
‘Content-Type’: ‘application/json’,
‘x-api-key’: process.env.ANTHROPIC_API_KEY,
‘anthropic-version’: ‘2023-06-01’
},
body: JSON.stringify({
model: ‘claude-sonnet-4-20250514’,
max_tokens: 1500,
system: ‘Brutally honest career analyst. Return only valid JSON.’,
messages: [{ role: ‘user’, content: prompt }]
})
});


const data = await response.json();
const text = data.content.map(i => i.text || '').join('');
const parsed = JSON.parse(text.replace(/json|/g, '').trim());
res.status(200).json(parsed);


} catch (err) {
res.status(500).json({ error: ‘Analysis failed. Please try again.’ });
}
}
