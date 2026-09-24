'use strict';
(() => {
  const host = document.createElement('div');
  host.id = 'en2en-extension-host';
  const shadow = host.attachShadow({ mode: 'closed' });
  const style = document.createElement('style');
  style.textContent = `
    :host{all:initial;position:fixed;z-index:2147483647;inset:0;pointer-events:none;
      font-family:system-ui,sans-serif;color-scheme:light;
      --surface:#fff;--text:#202124;--muted:#5f6368;--border:#dadce0;
      --error:#b3261e;--focus:#176b52;--shadow:#0003}
    *{box-sizing:border-box}
    .panel{position:fixed;pointer-events:auto;width:min(22.5em,calc(100vw - 24px));
      max-height:calc(100vh - 24px);overflow:auto;background:var(--surface);color:var(--text);
      border:1px solid var(--border);border-radius:.75em;box-shadow:0 .5em 1.75em var(--shadow);
      padding:1em;font:medium/1.5 system-ui,sans-serif}
    .header{display:flex;align-items:center;justify-content:space-between;gap:.5em;margin-bottom:.6em}
    .title{font-size:1em;font-weight:700}.close{border:0;background:transparent;
      font:1.4em/1 system-ui,sans-serif;cursor:pointer;color:var(--muted);padding:.1em}
    .body{white-space:pre-wrap;overflow-wrap:anywhere;min-height:1.5em}.error{color:var(--error)}
    button:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
    @media (prefers-color-scheme:dark){:host{color-scheme:dark;
      --surface:#25272a;--text:#f1f3f4;--muted:#bdc1c6;--border:#5f6368;
      --error:#ffb4ab;--focus:#81cdb1;--shadow:#0009}}
    @media (forced-colors:active){:host{--surface:Canvas;--text:CanvasText;
      --muted:CanvasText;--border:CanvasText;--error:CanvasText;
      --focus:Highlight;--shadow:transparent}}
  `;
  shadow.append(style);
  document.documentElement.append(host);
  let panel;
  let anchor = null;
  let selectedText = '';
  function close() { panel?.remove(); panel = null; anchor = null; selectedText = ''; }
  function position() {
    if (!panel) return;
    const selection = window.getSelection();
    if (selectedText && selection?.toString().trim() === selectedText && selection.rangeCount) {
      const live = selection.getRangeAt(0).getBoundingClientRect();
      if (live.width || live.height) anchor = live;
    }
    // CSS pixels already follow browser zoom. Measure the *visible* viewport for pinch zoom too.
    const viewport = window.visualViewport;
    const x = viewport?.offsetLeft ?? 0;
    const y = viewport?.offsetTop ?? 0;
    const widthAvailable = viewport?.width ?? window.innerWidth;
    const heightAvailable = viewport?.height ?? window.innerHeight;
    const gap = 12;
    panel.style.maxWidth = `${Math.max(0, widthAvailable - 2 * gap)}px`;
    panel.style.maxHeight = `${Math.max(0, heightAvailable - 2 * gap)}px`;
    const { width, height } = panel.getBoundingClientRect();
    const left = Math.max(x + gap, Math.min(anchor?.left ?? x + gap, x + widthAvailable - width - gap));
    const below = (anchor?.bottom ?? y + gap) + 8;
    const above = (anchor?.top ?? y + gap) - height - 8;
    const top = below + height <= y + heightAvailable - gap ? below :
      above >= y + gap && above + height <= y + heightAvailable - gap ? above :
      Math.max(y + gap, Math.min(below, y + heightAvailable - height - gap));
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  }
  window.addEventListener('resize', position);
  window.visualViewport?.addEventListener('resize', position);
  window.visualViewport?.addEventListener('scroll', position);
  window.addEventListener('scroll', position, true);
  function show(text, rect, state = 'success', selectionText = '') {
    close();
    panel = document.createElement('section'); panel.className = 'panel'; panel.setAttribute('role', state === 'error' ? 'alert' : 'status');
    const header = document.createElement('div'); header.className = 'header';
    const title = document.createElement('span'); title.className = 'title'; title.textContent = state === 'loading' ? 'En2En · Simplifying…' : state === 'error' ? 'En2En · Could not simplify' : 'En2En · Simple English';
    const closeButton = document.createElement('button'); closeButton.className = 'close'; closeButton.textContent = '×'; closeButton.setAttribute('aria-label', 'Close'); closeButton.addEventListener('click', close);
    header.append(title, closeButton);
    const body = document.createElement('div'); body.className = `body${state === 'error' ? ' error' : ''}`; body.textContent = text;
    panel.append(header, body);
    shadow.append(panel);
    anchor = rect;
    selectedText = selectionText;
    position();
  }
  globalThis.En2EnPopup = { show, close };
})();
