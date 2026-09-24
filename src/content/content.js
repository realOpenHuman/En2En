'use strict';
(() => {
  let current = null;

  async function explain(data) {
    En2EnPopup.show('Simplifying…', data.rect, 'loading', data.selectedText);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'EN2EN_SIMPLIFY',
        payload: { selectedText: data.selectedText, context: data.context }
      });
      if (!response?.ok) throw new Error(response?.error || 'Could not simplify this text.');
      En2EnPopup.show(response.result, data.rect, 'success', data.selectedText);
    } catch (error) {
      const message = error?.message?.includes('Receiving end does not exist')
        ? 'En2En background is not responding. Reload the extension and try again.'
        : error.message || 'Could not contact DeepSeek. Check your connection and try again.';
      En2EnPopup.show(message, data.rect, 'error', data.selectedText);
    }
  }

  // Capture selection/context while it is still available, but let the browser show its native menu.
  document.addEventListener('contextmenu', () => {
    const data = En2EnSelection.getSelectionData();
    current = data.selectedText ? data : null;
    En2EnPopup.close();
  }, true);

  chrome.runtime.onMessage.addListener(message => {
    if (message?.type !== 'EN2EN_EXPLAIN_SELECTION') return false;
    if (!current?.selectedText) {
      En2EnPopup.show('Select English text, then choose Explain in Simple English from the context menu.', null, 'error');
      return false;
    }
    explain(current);
    return false;
  });
})();
