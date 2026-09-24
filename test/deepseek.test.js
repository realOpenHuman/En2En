'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createUserPrompt } = require('../src/prompts/simplify.js');
const { simplify } = require('../src/api/deepseek.js');

test('prompt includes selected text and bounded-context input', () => {
  assert.match(createUserPrompt('The service will stop.', 'suspend'), /Context:\nThe service will stop\./);
  assert.match(createUserPrompt('context', 'suspend'), /Selected text:\nsuspend/);
});

test('simplify rejects empty API configuration without making a request', async () => {
  globalThis.EN2EN_CONFIG = { apiKey: '' };
  await assert.rejects(simplify({ context: 'a context', selectedText: 'word' }), /API key is not configured/);
});

test('simplify extracts successful response', async () => {
  globalThis.EN2EN_CONFIG = { apiKey: 'test-only', baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat' };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.headers.Authorization, 'Bearer test-only');
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: 'temporarily stop' } }] }) };
  };
  try {
    assert.equal(await simplify({ context: 'stop the service', selectedText: 'suspend' }), 'temporarily stop');
  } finally {
    globalThis.fetch = originalFetch;
    delete globalThis.EN2EN_CONFIG;
  }
});

test('simplify maps common HTTP errors to safe messages', async t => {
  globalThis.EN2EN_CONFIG = { apiKey: 'test-only' };
  const originalFetch = globalThis.fetch;
  for (const [status, message] of [[401, /invalid or unauthorized/], [429, /rate limit or quota/], [503, /service error/]]) {
    await t.test(String(status), async () => {
      globalThis.fetch = async () => ({ ok: false, status });
      await assert.rejects(simplify({ context: 'x', selectedText: 'x' }), message);
    });
  }
  globalThis.fetch = originalFetch;
  delete globalThis.EN2EN_CONFIG;
});
