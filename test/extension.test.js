'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('Chrome and Firefox expose an additive native selection context menu', () => {
  for (const file of ['manifest.json', 'manifest.firefox.json']) {
    const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.ok(manifest.permissions.includes('contextMenus'));
    assert.ok(manifest.content_scripts[0].js.includes('src/content/content.js'));
    assert.ok(!manifest.content_scripts[0].js.includes('src/content/context-menu.js'));
    if (file.includes('firefox')) {
      assert.deepEqual(manifest.background.scripts, ['config.js', 'src/prompts/simplify.js', 'src/api/deepseek.js', 'src/background/background.js']);
    } else {
      assert.equal(manifest.background.service_worker, 'src/background/worker.js');
    }
  }
  const background = fs.readFileSync('src/background/background.js', 'utf8');
  assert.match(background, /contexts:\s*\['selection'\]/);
  assert.match(background, /chrome\.contextMenus\.onClicked/);
  assert.match(background, /E&xplain in Simple English/);
  assert.doesNotMatch(background, /importScripts\s*\(/);
  const content = fs.readFileSync('src/content/content.js', 'utf8');
  assert.doesNotMatch(content, /preventDefault\s*\(/);
});

test('popup supports color preferences and repositions when the viewport changes', () => {
  const source = fs.readFileSync('src/content/result-popup.js', 'utf8');
  assert.match(source, /prefers-color-scheme:dark/);
  assert.match(source, /forced-colors:active/);
  assert.match(source, /window\.addEventListener\('resize', position\)/);
  assert.match(source, /visualViewport\?\.addEventListener\('resize', position\)/);
  assert.match(source, /panel\.getBoundingClientRect\(\)/);
  assert.match(source, /font:medium\/1\.5/);
  assert.match(source, /visualViewport\?.*|const viewport = window\.visualViewport/);
  assert.doesNotMatch(source, /clipboard|textContent = 'Copy'|className = 'copy'/);
});

test('popup remeasures and stays inside a smaller viewport', () => {
  const listeners = {};
  let panel;
  function element() {
    return {
      style: {}, children: [],
      append(...children) { this.children.push(...children); if (this.className === undefined && children.some(child => child.className === 'panel')) panel = children.find(child => child.className === 'panel'); },
      remove() {}, addEventListener() {}, setAttribute() {},
      attachShadow() { return element(); },
      getBoundingClientRect() { return { width: Math.min(360, parseFloat(this.style.maxWidth)), height: Math.min(160, parseFloat(this.style.maxHeight)) }; }
    };
  }
  const viewport = { width: 500, height: 400, offsetLeft: 0, offsetTop: 0, addEventListener(name, callback) { listeners[`visual:${name}`] = callback; } };
  const window = { innerWidth: 500, innerHeight: 400, visualViewport: viewport,
    addEventListener(name, callback) { listeners[name] = callback; }, getSelection() { return null; } };
  const context = vm.createContext({ window, document: { createElement: element, documentElement: { append() {} } } });
  vm.runInContext(fs.readFileSync('src/content/result-popup.js', 'utf8'), context);
  context.En2EnPopup.show('test', { left: 440, top: 350, bottom: 370 }, 'success');
  assert.equal(panel.style.left, '128px');
  assert.equal(panel.style.top, '182px');
  viewport.width = 200; viewport.height = 160;
  listeners['visual:resize']();
  assert.equal(panel.style.maxWidth, '176px');
  assert.equal(panel.style.maxHeight, '136px');
  assert.equal(panel.style.left, '12px');
  assert.equal(panel.style.top, '12px');
  assert.equal(panel.children.length, 2); // Header and body; no Copy action.
});

test('Firefox background scripts load together and register the X menu', () => {
  const listeners = {};
  const created = [];
  const context = vm.createContext({
    browser: {},
    chrome: {
      contextMenus: {
        removeAll(callback) { created.length = 0; callback(); },
        create(item) { created.push(item); },
        onClicked: { addListener(fn) { listeners.clicked = fn; } }
      },
      runtime: {
        onInstalled: { addListener(fn) { listeners.installed = fn; } },
        onStartup: { addListener(fn) { listeners.startup = fn; } },
        onMessage: { addListener(fn) { listeners.message = fn; } }
      }
    }
  });
  for (const file of ['src/prompts/simplify.js', 'src/api/deepseek.js', 'src/background/background.js']) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
  }
  listeners.installed();
  assert.equal(created.length, 1);
  assert.equal(created[0].title, 'E&xplain in Simple English');
  assert.deepEqual(Array.from(created[0].contexts), ['selection']);
  listeners.startup();
  assert.equal(created.length, 1);
});
