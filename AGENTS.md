# AGENTS.md

## 1. 项目概述

本项目是一个面向英语学习者的浏览器扩展。
本项目名称为En2En
核心功能：

> English → Simple English

用户在网页中选中较难的英文单词、短语、句子或短段落，通过右键菜单调用 DeepSeek API，将其解释或改写成更加简单的英文。

这不是中英翻译插件。

默认情况下：

* 不翻译成中文
* 不进入聊天模式
* 不生成冗长解释
* 尽量只返回最终的简单英文结果

核心流程：

```text
网页
↓
用户选中英文
↓
右键
↓
显示扩展轻量菜单
↓
点击 Explain in Simple English
或按 E
↓
提取选中文字 + 少量上下文
↓
调用 DeepSeek API
↓
返回 Simple English
↓
在选中文字附近显示 Popup
```

---

# 2. 核心产品原则

项目始终围绕：

```text
Difficult English
↓
Simple English
↓
Understand
```

而不是：

```text
Difficult English
↓
Chinese
↓
Understand
```

也不要变成：

```text
Difficult English
↓
AI Chat
```

---

# 3. MVP 功能

MVP 必须完成：

1. Chrome Manifest V3 扩展
2. 获取用户选中的英文
3. 用户右键时显示自定义轻量菜单
4. 菜单中显示：

```text
E   Explain in Simple English
```

5. 菜单打开状态下按 `E` 可以直接调用解释
6. 获取有限上下文
7. 调用 DeepSeek API
8. 显示 Loading
9. 显示 Simple English 结果
10. 支持 Copy
11. 支持 Close
12. API 错误处理
13. API Key 从 `.env` 获取

---

# 4. 非目标

MVP 阶段不要实现：

* Chatbot
* 中文翻译
* Sidebar AI
* 账号系统
* 云同步
* 生词本
* Spaced Repetition
* Analytics
* 复杂动画
* React/Vue/Svelte
* 大型 UI 框架

这些功能以后再考虑。

---

# 5. 技术栈

优先：

```text
Chrome Extension
Manifest V3

HTML
CSS
Vanilla JavaScript

DeepSeek API
OpenAI Compatible API

.env

Content Script
Background Service Worker
Shadow DOM
```

除非确有必要，不引入大型框架。

---

# 6. 推荐项目结构

```text
/
├── AGENTS.md
├── README.md
├── manifest.json
├── package.json
├── .gitignore
├── .env
├── .env.example
│
├── src/
│   ├── background/
│   │   └── background.js
│   │
│   ├── content/
│   │   ├── content.js
│   │   ├── selection.js
│   │   ├── context-menu.js
│   │   ├── result-popup.js
│   │   └── content.css
│   │
│   ├── api/
│   │   └── deepseek.js
│   │
│   ├── prompts/
│   │   └── simplify.js
│   │
│   └── utils/
│       └── text.js
│
├── scripts/
│   └── build.js
│
├── assets/
│   └── icons/
│
└── dist/
```

可以根据实际实现做小幅调整。

不要把所有逻辑放进一个文件。

---

# 7. `.env` 要求

项目根目录必须存在：

```text
.env
```

至少包含：

```env
DEEPSEEK_API_KEY=
```

用户会自行填写真实 API Key。

例如：

```env
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
```

Agent 不得：

* 自动填写真实 API Key
* 猜测 API Key
* 创建假的真实密钥
* 将真实密钥写入 README
* 将真实密钥提交到 Git

---

# 8. `.env.example`

项目同时必须创建：

```text
.env.example
```

内容至少为：

```env
DEEPSEEK_API_KEY=
```

如果后续增加可配置项，可以扩展为：

```env
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

`.env.example` 可以提交 Git。

`.env` 不可以提交。

---

# 9. `.gitignore`

`.gitignore` 必须至少包含：

```gitignore
.env
.env.*
!.env.example

node_modules/
dist/
```

如果构建产物需要保留 `dist/`，可以根据项目实际需求调整。

但：

```text
.env
```

必须被忽略。

---

# 10. `.env` 的使用方式

浏览器扩展运行时不能像 Node.js 一样直接读取：

```text
.env
```

因此 API Key 必须在开发或构建阶段读取。

推荐流程：

```text
.env
↓
Build Script
↓
读取 DEEPSEEK_API_KEY
↓
注入构建后的扩展代码
↓
dist/
```

不要在运行时尝试：

```javascript
process.env.DEEPSEEK_API_KEY
```

除非已经存在对应构建工具负责替换。

浏览器本身没有：

```javascript
process.env
```

---

# 11. 构建脚本

如果项目不使用 Vite/Webpack 等工具，优先创建一个简单的 Node.js Build Script。

例如：

```text
scripts/build.js
```

其职责：

1. 读取 `.env`
2. 获取 `DEEPSEEK_API_KEY`
3. 验证变量存在
4. 将 API Key 注入构建后的配置文件
5. 将扩展源码复制到 `dist/`
6. 不修改原始源码中的 Secret Placeholder

开发者最终加载：

```text
dist/
```

作为 Chrome Extension。

---

# 12. 环境变量检查

如果 `.env` 中：

```env
DEEPSEEK_API_KEY=
```

为空：

构建脚本应该明确提示：

```text
DEEPSEEK_API_KEY is not configured.
Please add your DeepSeek API key to .env.
```

不要静默生成不可工作的扩展。

---

# 13. API Key 安全说明

虽然使用 `.env` 可以避免：

```text
API Key 被提交到 Git
```

但这并不能真正隐藏浏览器扩展中的 API Key。

因为构建后的扩展代码运行在用户电脑中。

最终 API Key 可能存在于：

```text
dist/
```

或者浏览器运行时内存中。

因此：

`.env` 的主要作用是：

```text
避免 Secret 出现在 Git Repository
```

而不是：

```text
让浏览器端 Secret 无法被提取
```

这是个人使用项目时可以接受的折中。

如果未来公开分发插件，应考虑服务器 Proxy。

---

# 14. DeepSeek API 配置

默认：

```text
Base URL:
https://api.deepseek.com

Model:
deepseek-chat
```

API Key 来源必须是：

```env
DEEPSEEK_API_KEY
```

不要使用：

```javascript
const API_KEY = "sk-xxxxx";
```

这种硬编码方式。

---

# 15. DeepSeek API 模块

API 请求集中放在：

```text
src/api/deepseek.js
```

负责：

* 构造请求
* Authorization Header
* Model
* Prompt
* HTTP Error
* Response Parsing
* Timeout
* 输出提取

UI 层不要直接拼接 API 请求。

---

# 16. Prompt 模块

Prompt 集中放在：

```text
src/prompts/simplify.js
```

不要把 Prompt 分散在多个文件。

建议 System Prompt：

```text
You are an English learning assistant.

Your task is to explain or rewrite the selected English text using simpler English.

Rules:

1. Use English only.
2. Never translate into Chinese or another language.
3. Preserve the original meaning.
4. Prefer common and easy English words.
5. Be concise.
6. Do not add greetings.
7. Do not say "Here is the simplified version".
8. Do not explain your reasoning.
9. Output only the final explanation or rewrite.
10. Use context only to determine the intended meaning.

If the selected text is a single word or short phrase:
return a short and simple definition suitable for the context.

If the selected text is a sentence or paragraph:
rewrite it using simpler English while preserving the meaning.
```

建议：

```text
temperature = 0.2
```

---

# 17. Prompt 输入格式

例如网页内容：

```text
The current business model is becoming untenable.
```

用户选择：

```text
untenable
```

请求组织为：

```text
Context:
The current business model is becoming untenable.

Selected text:
untenable

Explain only the selected text using simple English.
```

理想返回：

```text
unable to continue because it has serious problems
```

而不是：

```text
Sure! The word "untenable" means...
```

---

# 18. Selection

支持：

* 单词
* 短语
* 句子
* 短段落

建议最大长度：

```text
2000 characters
```

超过时提示：

```text
Selected text is too long.
```

---

# 19. 上下文提取

单词存在多义性，因此不能永远只把 Selection 发给模型。

例如：

```text
Apple decided to suspend the program.
```

Selection：

```text
suspend
```

应该利用上下文判断为：

```text
temporarily stop
```

而不是：

```text
hang something from above
```

优先发送：

* 当前句
* 必要的前后一句
* 附近少量文字

不要发送整个网页。

上下文建议控制在：

```text
500～1000 characters
```

以内。

---

# 20. 自定义右键菜单

用户选中文字并右键后，显示扩展自己的轻量菜单。

例如：

```text
┌──────────────────────────────┐
│ E   Explain in Simple English│
└──────────────────────────────┘
```

使用 Content Script 实现。

不要依赖：

```javascript
chrome.contextMenus
```

去实现单字符 `E` 快捷调用。

---

# 21. E 快捷键

当扩展右键菜单打开：

```text
E
```

或：

```text
e
```

都应该调用解释。

逻辑类似：

```javascript
if (
  contextMenuVisible &&
  event.key.toLowerCase() === "e"
) {
  explainSelectedText();
}
```

执行后：

```text
关闭菜单
↓
显示 Loading
↓
请求 DeepSeek
↓
显示 Result
```

---

# 22. 禁止全局拦截 E

绝对不要：

```text
用户平时按 E
↓
触发 AI
```

只有：

```text
扩展自定义右键菜单打开
```

时，裸键 `E` 才有特殊含义。

以下场景必须保持正常：

* input
* textarea
* contenteditable
* 搜索框
* Gmail
* Chat
* Google Docs 类页面

---

# 23. 菜单关闭

以下情况关闭：

* 点击菜单项
* 按 E
* 按 Escape
* 点击其他区域
* 页面滚动
* 用户重新右键
* 页面发生导航

页面最多只能存在一个菜单。

---

# 24. UI 隔离

自定义菜单和结果 Popup 优先使用：

```text
Shadow DOM
```

防止网页 CSS：

```css
div {}
button {}
* {}
```

污染扩展界面。

---

# 25. Result Popup

显示在 Selection 附近。

状态包括：

```text
Loading
Success
Error
```

Loading：

```text
Simplifying...
```

Success：

```text
AI 返回的简单英文
```

按钮：

```text
Copy
Close
```

不要打开新 Tab。

---

# 26. 错误处理

至少处理：

```text
401
API Key 无效

429
Rate Limit / Quota

5xx
DeepSeek 服务错误

Network Error
网络请求失败

Empty API Key
.env 没有填写 API Key
```

不要把 API Key 显示在 Error Message 中。

---

# 27. 隐私原则

只发送：

```text
用户 Selection
+
理解语境所需的最少上下文
```

不要发送：

* 整个网页
* 浏览历史
* Cookie
* Password
* 表单内容
* 无关正文

README 必须说明：

```text
选中的文本和少量上下文会发送给 DeepSeek API。
```

不能声称：

```text
100% Local
```

---

# 28. 代码规范

优先：

* 小函数
* 清晰命名
* async/await
* early return
* 明确模块边界
* 少量依赖
* Browser Native API

避免：

* 巨型函数
* 全局可变状态
* Callback Hell
* 过度抽象
* 过度工程化

---

# 29. Agent 工作原则

修改代码前：

1. 阅读 `AGENTS.md`
2. 阅读 `README.md`
3. 阅读 `manifest.json`
4. 检查现有目录结构
5. 检查 `.env.example`
6. 检查 `.gitignore`

不要无理由重构已经工作的部分。

---

# 30. Agent Secret 规则

Agent 永远不得：

* 输出 `.env` 中的真实 API Key
* 将 Secret 写入日志
* 将 Secret 提交 Git
* 将 Secret 写进 README
* 将 Secret 写进测试 Snapshot
* 将 Secret 写进示例代码

如果需要展示环境变量：

只使用：

```env
DEEPSEEK_API_KEY=
```

或：

```env
DEEPSEEK_API_KEY=your_api_key_here
```

---

# 31. 开发顺序

## Phase 1

创建：

```text
manifest.json
package.json
.gitignore
.env
.env.example
基础目录
```

`.env` 必须至少：

```env
DEEPSEEK_API_KEY=
```

---

## Phase 2

实现：

```text
Build Script
↓
读取 .env
↓
生成 dist/
```

确认 API Key 不会进入 Git。

---

## Phase 3

实现：

```text
Selection
↓
获取 Selection Rect
↓
获取有限上下文
```

---

## Phase 4

实现：

```text
右键
↓
自定义菜单
```

显示：

```text
E   Explain in Simple English
```

---

## Phase 5

实现：

```text
右键
↓
E
↓
触发解释
```

先返回：

```text
Test explanation
```

验证 UI。

---

## Phase 6

实现：

```text
Loading Popup
Result Popup
Copy
Close
Error
```

---

## Phase 7

实现：

```text
DeepSeek API
```

连接：

```text
Selection
↓
Context
↓
Prompt
↓
DeepSeek
↓
Result Popup
```

---

## Phase 8

完成 End-to-End 测试：

```text
选中文字
↓
右键
↓
E
↓
Simplifying...
↓
DeepSeek API
↓
Simple English
```

---

# 32. 测试案例

### 单词

输入：

```text
ramification
```

返回简单英文定义。

### 多义词

原句：

```text
The company decided to suspend the service temporarily.
```

Selection：

```text
suspend
```

应表达：

```text
temporarily stop
```

### 短语

```text
a contentious issue
```

可以返回：

```text
an issue that causes a lot of disagreement
```

### 句子

```text
The ramifications of this decision are profound.
```

可以返回：

```text
This decision will have very important effects.
```

---

# 33. MVP 完成条件

只有以下全部通过，才算 MVP 完成：

* Chrome 可以加载扩展
* `.env` 存在
* `.env` 包含 `DEEPSEEK_API_KEY=`
* `.env.example` 存在
* `.env` 被 `.gitignore` 忽略
* Build 可以读取环境变量
* 可以选中文字
* 可以打开自定义右键菜单
* 菜单显示 `E`
* 右键后按 `E` 可以执行
* 普通输入 E 不会误触
* 可以获取有限上下文
* DeepSeek API 可以正常调用
* Loading 正常
* Result Popup 正常
* Copy 正常
* Close 正常
* Error Handling 正常
* Repository 中不存在真实 API Key

---

# 34. 初始 Agent 任务

如果 Repository 当前为空：

立即完成第一个可运行 Vertical Slice。

首先创建：

```text
.env
.env.example
.gitignore
package.json
manifest.json
```

其中：

`.env`

```env
DEEPSEEK_API_KEY=
```

`.env.example`

```env
DEEPSEEK_API_KEY=
```

然后按顺序完成：

```text
Selection
↓
Custom Context Menu
↓
E Shortcut
↓
Context Extraction
↓
DeepSeek API
↓
Result Popup
```

不要提前实现：

```text
CEFR
生词本
账号
云同步
Analytics
Chatbot
Sidebar
```

最终必须实际验证完整流程：

```text
选中文字
↓
右键
↓
E
↓
DeepSeek
↓
Simple English Popup
```
