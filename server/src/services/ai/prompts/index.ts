export const SENTIMENT_PROMPT = (text: string) => `
Analyze the sentiment of the following text. Return ONLY a valid JSON object with no additional text.

Text: "${text}"

Return format:
{
  "label": "positive" | "negative" | "neutral" | "mixed",
  "score": <number between -1.0 and 1.0 where -1 is very negative, 0 is neutral, 1 is very positive>
}
`;

export const INTENT_PROMPT = (
  text: string,
  context?: { keywords?: string[]; competitors?: string[]; source?: string }
) => `
You are a B2B sales intelligence AI. Analyze this social media post/comment for buying intent signals.

Text: "${text}"
${context?.source ? `Source: ${context.source}` : ''}
${context?.keywords?.length ? `Monitored keywords: ${context.keywords.join(', ')}` : ''}
${context?.competitors?.length ? `Competitors: ${context.competitors.join(', ')}` : ''}

Score this from 0-100 for buying intent:
- 0-20: No intent (general discussion, news, memes)
- 21-40: Low intent (mentions industry but no buying signals)
- 41-60: Medium intent (asking questions, exploring options)
- 61-80: High intent (comparing tools, asking for alternatives, describing pain points)
- 81-100: Hot intent (actively looking to buy, requesting demos, switching from competitor)

Ignore job seekers, students, and recruiters — score them low.

Return ONLY valid JSON:
{
  "score": <number 0-100>,
  "label": "low" | "medium" | "high" | "hot",
  "reasoning": "<1-2 sentence explanation>"
}
`;

export const SUMMARY_PROMPT = (text: string) => `
Summarize this social media post/comment in 1-2 concise sentences for a B2B sales team. Focus on the key pain points, needs, or intent signals.

Text: "${text}"

Return only the summary text, no JSON wrapping.
`;

export const OUTREACH_PROMPT = (input: {
  signalText: string;
  source: string;
  authorName?: string;
  companyName?: string;
  intentReason?: string;
  tone?: string;
}) => `
You are a B2B outreach copywriter. Generate a personalized outreach message based on a social signal.

Signal from ${input.source}: "${input.signalText}"
${input.authorName ? `Author: ${input.authorName}` : ''}
${input.companyName ? `Company: ${input.companyName}` : ''}
${input.intentReason ? `Intent reason: ${input.intentReason}` : ''}
Tone: ${input.tone || 'professional, concise, founder-led B2B'}

Requirements:
- Reference the specific signal/pain point
- Be concise and context-aware
- Don't be pushy or salesy
- Sound human, not templated

Return ONLY valid JSON:
{
  "opener": "<short 1-line hook, like a DM opener or email subject>",
  "message": "<2-3 paragraph outreach message>"
}
`;
