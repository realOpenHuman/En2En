# En2En

**用简单英语理解复杂英语。** En2En 是一款适用于 Firefox 和 Chrome 的 Manifest V3 浏览器扩展：选中网页中的单词、短语、句子或短段落，在原生右键菜单中选择 **Explain in Simple English**，获取简洁的英文解释或改写。它不是翻译工具，也不是聊天机器人。

[Read this documentation in English →](README.en.md)

## 功能

- 通过浏览器原生右键菜单添加解释命令，不替换网页或浏览器已有菜单项。
- 为选中内容提取有限上下文（最多 800 个字符），帮助判断词义；选中内容最多 2,000 个字符。
- 调用 DeepSeek API，以英文返回简洁解释或改写。
- 结果弹窗支持关闭，适配亮色、深色、高对比度及浏览器缩放。
- API 请求在扩展后台处理，并设置 30 秒超时及常见错误提示。

## 环境要求

- Node.js 18 或更新版本
- Firefox（Manifest V3，最低版本见 `manifest.firefox.json`）或支持 Manifest V3 的 Chrome
- DeepSeek API Key；API 使用可能产生费用，请查看 DeepSeek 的最新定价

## 配置与构建

1. 克隆仓库，在根目录创建 `.env`（或使用已有文件），填写自己的密钥：

   ```env
   DEEPSEEK_API_KEY=your_api_key_here
   ```

   可选配置：

   ```env
   DEEPSEEK_BASE_URL=https://api.deepseek.com
   DEEPSEEK_MODEL=deepseek-chat
   ```

2. 执行对应构建命令：

   ```sh
   npm run build:firefox
   # 或
   npm run build:chrome
   ```

   产物分别位于 `dist/firefox/` 和 `dist/chrome/`。未配置 API Key 时构建会失败并给出提示。构建脚本不输出密钥。

3. **Firefox 临时加载：**打开 `about:debugging#/runtime/this-firefox`，点击 **Load Temporary Add-on…**，选择 `dist/firefox/manifest.json`。临时扩展在 Firefox 关闭后会被移除；长期发布需通过 Mozilla Add-ons（AMO）签名。

   **Chrome 本地加载：**打开 `chrome://extensions`，启用开发者模式，选择 **Load unpacked**，加载 `dist/chrome/`。

4. 在普通网页中选中文字并右键，选择 **Explain in Simple English**。Firefox 原生菜单可尝试按 **X** 使用该菜单项的访问键；Chrome 中请点击菜单项。浏览器内部页面（如 `about:`）不允许内容脚本运行。

> 修改 `.env` 后必须重新构建。重新构建后，请在浏览器中重新加载扩展并刷新测试页面。

## 测试

```sh
npm test
```

测试覆盖 API 响应与错误处理、浏览器菜单配置、后台脚本加载，以及弹窗主题和视口定位。浏览器端完整交互仍需在 Firefox 和 Chrome 中手动验证。

## 隐私与安全

- 只有用户主动选择并请求解释时，选中文字和附近最多 800 个字符的文本上下文才会发送给 DeepSeek API。不要选择密码、个人信息或其他敏感内容。
- API Key 会被构建脚本注入 `dist/` 中的扩展代码。**浏览器扩展中的密钥可被使用者提取；`.env` 和 `.gitignore` 只能降低误提交到 Git 的风险，不能保护已分发的密钥。**
- 不要提交 `.env` 或 `dist/`，也不要发布包含个人 API Key 的构建产物。公开分发应改用服务端代理及适当的密钥管理。
- DeepSeek 会按其服务条款及隐私政策处理收到的内容。使用前请自行审阅相关政策。

## 开源发布检查清单

本仓库目前适合继续完善和公开审查，但**发布前仍需完成许可和发布准备**：

- 选择并添加明确的开源许可证（当前仓库没有 `LICENSE` 文件；没有许可证时，其他人通常不能合法地按开源方式复用代码）。
- 确认 `.env` 和 `dist/` 未被 Git 跟踪，且仓库历史、Issue、截图和日志中没有密钥。
- 在目标 Firefox/Chrome 版本中实际验证右键菜单、API 成功/失败、深浅色与缩放；目前自动化测试不等同于浏览器端到端测试。
- 如计划发布到扩展商店，准备图标、截图、隐私说明、商店 listing，并检查商店政策与 API 密钥分发方案。

## 贡献

欢迎提交 Issue 和 Pull Request。提交前请运行 `npm test`，并说明浏览器手动验证情况。请勿在 Issue、日志或测试中粘贴真实 API Key 或敏感网页内容。

---

[English documentation](README.en.md)
