'use strict';
(() => {
const { SYSTEM_PROMPT, createUserPrompt } = globalThis.En2EnPrompts;

async function simplify({ context, selectedText }) {
  const config = globalThis.EN2EN_CONFIG || {};
  if (!config.apiKey) throw new Error('DeepSeek API key is not configured. Add DEEPSEEK_API_KEY to .env and rebuild.');
  const baseUrl = (config.baseUrl || 'https://api.deepseek.com').replace(/\/+$/, '');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    let response;
    try {
      response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
        body: JSON.stringify({ model: config.model || 'deepseek-chat', temperature: 0.2, messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: createUserPrompt(context, selectedText) }
        ] }),
        signal: controller.signal
      });
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('The request timed out. Please try again.');
      throw new Error('Network request failed. Check your connection and try again.');
    }
    if (response.status === 401 || response.status === 403) throw new Error('DeepSeek API key is invalid or unauthorized.');
    if (response.status === 429) throw new Error('DeepSeek rate limit or quota reached. Please try again later.');
    if (response.status >= 500) throw new Error('DeepSeek service error. Please try again later.');
    if (!response.ok) throw new Error(`DeepSeek request failed (${response.status}).`);
    const data = await response.json();
    const result = data?.choices?.[0]?.message?.content?.trim();
    if (!result) throw new Error('DeepSeek returned an empty response. Please try again.');
    return result;
  } finally {
    clearTimeout(timeout);
  }
}

globalThis.En2EnApi = { simplify };
if (typeof module !== 'undefined') module.exports = globalThis.En2EnApi;
})();
