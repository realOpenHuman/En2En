'use strict';
(() => {
  const MAX_SELECTION = 2000;
  const MAX_CONTEXT = 800;
  function getSelectionData() {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || '';
    if (!selectedText) return { error: 'Select some English text first.' };
    if (selectedText.length > MAX_SELECTION) return { error: 'Selected text is too long.' };
    let context = selectedText;
    if (selection.rangeCount) {
      const node = selection.getRangeAt(0).commonAncestorContainer;
      const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
      const block = element?.closest('p, li, blockquote, article, section, div') || element;
      // Avoid reading form values or editable/private input content as context.
      if (block && !block.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]')) {
        context = (block.innerText || block.textContent || selectedText).replace(/\s+/g, ' ').trim().slice(0, MAX_CONTEXT);
      }
    }
    const range = selection.rangeCount ? selection.getRangeAt(0) : null;
    const rect = range?.getBoundingClientRect();
    return { selectedText, context, rect: rect ? { left: rect.left, bottom: rect.bottom, right: rect.right, top: rect.top } : null };
  }
  globalThis.En2EnSelection = { getSelectionData, MAX_SELECTION, MAX_CONTEXT };
})();
