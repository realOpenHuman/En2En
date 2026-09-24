'use strict';
const MENU_ID = 'en2en-explain-simple-english';
const isFirefox = typeof browser !== 'undefined';

function registerMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      // Firefox interprets &x as the native context-menu access key X.
      title: isFirefox ? 'E&xplain in Simple English' : 'Explain in Simple English (X)',
      contexts: ['selection']
    });
  });
}

chrome.runtime.onInstalled.addListener(registerMenu);
// Firefox may restart its background page without firing onInstalled again.
if (isFirefox) chrome.runtime.onStartup.addListener(registerMenu);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab?.id) return;
  const options = Number.isInteger(info.frameId) ? { frameId: info.frameId } : {};
  chrome.tabs.sendMessage(tab.id, { type: 'EN2EN_EXPLAIN_SELECTION' }, options, () => {
    // Some pages (for example browser-internal pages) do not allow content scripts.
    void chrome.runtime.lastError;
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'EN2EN_SIMPLIFY') return false;
  (async () => {
    try {
      const result = await En2EnApi.simplify(message.payload || {});
      sendResponse({ ok: true, result });
    } catch (error) {
      sendResponse({ ok: false, error: error.message || 'Could not simplify this text.' });
    }
  })();
  return true;
});
