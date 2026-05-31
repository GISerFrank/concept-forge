# ConceptForge Pro ⚒️

> 学术写作「概念升格」引擎 —— 将口语化想法一键重构为期刊级学术表达

ConceptForge 是一款面向学术写作者的 AI 辅助工具。它能将草稿、口语笔记或田野观察等非正式文本，通过多层次分析自动转化为符合顶级期刊标准的学术语言，并提供机制推演、理论对话和审稿人模拟等深度功能。

## ✨ 核心功能

### 🔬 三层概念升格 (Concept Elevation)

- **Level 1 · 术语映射**：识别口语化表达，精准替换为学科专业术语，并标注术语类型
- **Level 2 · 机制重构**：提炼文本背后的因果逻辑链，以 `A → B → C` 的形式可视化呈现关键机制
- **Level 3 · 理论整合与重写**：关联经典学术理论，将原文改写为结构严谨、可直接用于论文的学术段落

### 🎯 学科透镜 (Discipline Lens)

内置管理学、社会学、心理学、教育学、计算机、通用社科等学科预设，也支持自定义任意理论视角（如"博弈论"、"女性主义"等）。所有分析结果均基于所选学科的术语体系和理论框架生成。自定义透镜可一键保存为常用预设。

### 🤖 多模型引擎支持

灵活接入三大 LLM 服务商，按需切换：

| 服务商 | 支持模型 |
|--------|---------|
| Google Gemini | Gemini 3 Pro Preview, Gemini 2.0 Flash 等 |
| OpenAI | GPT-5.1, GPT-5-mini, GPT-4.1, o3, o4-mini 等 |
| DeepSeek | DeepSeek-Chat (V3.2), DeepSeek-Reasoner 等 |

API Key 仅存储在本地浏览器 `localStorage` 中，不会上传至任何服务器。

### 📝 附加工具

- **标题工坊**：基于升格后的学术文本，自动生成冒号式、提问式、陈述式三种期刊论文标题
- **模拟审稿人 (Reviewer 2)**：以严格审稿人视角指出逻辑漏洞，给出替代性解释和总体评价
- **历史记录**：自动保留最近的输入记录，方便快速回溯

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm 或其他包管理器

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/your-repo/concept-forge.git
cd concept-forge

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器访问 `http://localhost:5173` 即可使用。

### 构建生产版本

```bash
npm run build
npm run preview   # 本地预览构建产物
```

## 🛠️ 技术栈

- **框架**：React 19 + TypeScript
- **构建工具**：Vite 7
- **样式**：Tailwind CSS 3
- **图标**：Lucide React
- **引导**：Driver.js（首次访问自动引导）

## 📖 使用流程

1. **选择学科透镜** — 从预设中选取或自定义输入你的学科/理论框架
2. **配置 AI 引擎** — 点击右上角设置按钮，选择服务商并填入 API Key
3. **粘贴原始语料** — 将草稿、笔记或口语化想法粘贴到输入框（支持拖拽调整高度）
4. **一键升格** — 点击「开始升格」，等待 AI 返回三层分析结果
5. **深度打磨** — 在结果区域使用「标题工坊」或「模拟审稿人」进一步优化

## 📂 项目结构

```
concept-forge-main/
├── index.html              # 入口 HTML
├── package.json            # 项目配置与依赖
├── vite.config.ts          # Vite 构建配置
├── tailwind.config.js      # Tailwind CSS 配置
├── tsconfig.json           # TypeScript 配置
├── public/                 # 静态资源
└── src/
    ├── main.tsx            # 应用入口
    ├── App.tsx             # 核心组件（含全部业务逻辑）
    ├── App.css             # 基础样式
    └── index.css           # Tailwind 指令 + Driver.js 主题定制
```

## 🔑 API Key 获取

| 服务商 | 获取地址 |
|--------|---------|
| Google Gemini | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| OpenAI | [OpenAI Platform](https://platform.openai.com/api-keys) |
| DeepSeek | [DeepSeek Platform](https://platform.deepseek.com/api_keys) |

> 💡 **推荐**：DeepSeek 性价比极高，适合高频使用场景。

## 📄 License

本项目基于 [MIT License](./LICENSE) 开源。
