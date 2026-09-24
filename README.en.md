# En2En

**Understand difficult English in simple English.** En2En is a Manifest V3 browser extension for Firefox and Chrome. Select a word, phrase, sentence, or short passage on a webpage, then choose **Explain in Simple English** from the browser's native context menu. It returns a concise English definition or rewrite—not a translation or chatbot response.

[中文文档 →](README.md)

## Features

- Adds an explanation command to the browser's native context menu without replacing existing browser or webpage menu items.
- Extracts limited nearby context (up to 800 characters) to help resolve meaning; selections are limited to 2,000 characters.
- Calls the DeepSeek API and returns a concise English explanation or rewrite.
- Result popup supports close, light/dark/high-contrast themes, and browser zoom.
- API requests run in the extension background and include a 30-second timeout and common error handling.

## Requirements

- Node.js 18 or later
- Firefox with Manifest V3 (minimum version is specified in `manifest.firefox.json`) or a Manifest V3-compatible version of Chrome
- A DeepSeek API key. API usage may incur charges; check DeepSeek's current pricing.

## Configure and build

1. Clone the repository and create `.env` in the project root (if it does not already exist). Add your own key:

   ```env
   DEEPSEEK_API_KEY=your_api_key_here
   ```

   Optional settings:

   ```env
   DEEPSEEK_BASE_URL=https://api.deepseek.com
   DEEPSEEK_MODEL=deepseek-chat
   ```

2. Build the target browser package:

   ```sh
   npm run build:firefox
   # or
   npm run build:chrome
   ```

   Packages are written to `dist/firefox/` and `dist/chrome/`, respectively. The build fails with a clear message if the API key is missing; it does not print the key.

3. **Temporary Firefox install:** open `about:debugging#/runtime/this-firefox`, choose **Load Temporary Add-on…**, and select `dist/firefox/manifest.json`. Temporary add-ons are removed when Firefox closes; persistent distribution requires signing through Mozilla Add-ons (AMO).

   **Local Chrome install:** open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select `dist/chrome/`.

4. Select text on a regular webpage, right-click, and choose **Explain in Simple English**. In Firefox, you can try pressing **X** to use the menu item's access key; in Chrome, click the item. Browser-internal pages such as `about:` pages do not allow content scripts.

> After changing `.env`, rebuild the extension. After rebuilding, reload it in the browser and refresh the test page.

## Tests

```sh
npm test
```

Tests cover API responses and error handling, browser menu configuration, background script loading, and popup theme/viewport positioning. Automated tests do not replace manual end-to-end checks in Firefox and Chrome.

## Privacy and security

- Only after the user explicitly requests an explanation, the selected text and up to 800 characters of nearby context are sent to DeepSeek. Do not select passwords, personal information, or other sensitive content.
- DeepSeek processes submitted content under its own terms and privacy policy. Review those policies before use.


## Contributing

Issues and pull requests are welcome. Run `npm test` before submitting and state which browsers you manually tested. Never include real API keys or sensitive webpage text in issues, logs, or tests.

---

[中文文档](README.md)
