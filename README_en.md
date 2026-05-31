# ConceptForge Pro ⚒️

> An academic writing "concept elevation" engine — transform colloquial ideas into journal-grade scholarly prose with one click.

ConceptForge is an AI-powered tool designed for academic writers. It takes informal input — rough drafts, spoken-language notes, or field observations — and restructures it into rigorous academic language that meets top-tier journal standards, complete with mechanism reasoning, theoretical grounding, and simulated peer review.

## ✨ Key Features

### 🔬 Three-Level Concept Elevation

- **Level 1 · Terminology Mapping**: Detects colloquial expressions and replaces them with discipline-specific academic terms, annotated by category
- **Level 2 · Mechanism Reconstruction**: Extracts the causal logic behind the text and visualizes it as a clear `A → B → C` mechanism flow
- **Level 3 · Theoretical Integration & Rewriting**: Links the content to established academic theories and rewrites the original text into a publication-ready scholarly paragraph

### 🎯 Discipline Lens

Choose from built-in presets — Management, Sociology, Psychology, Education, Computer Science, General Social Science — or define any custom theoretical perspective (e.g. "Game Theory", "Feminism"). All outputs are generated through the terminology and theoretical framework of the selected discipline. Custom lenses can be saved as reusable presets.

### 🤖 Multi-Model Engine

Seamlessly switch between three major LLM providers:

| Provider | Supported Models |
|----------|-----------------|
| Google Gemini | Gemini 3 Pro Preview, Gemini 2.0 Flash, etc. |
| OpenAI | GPT-5.1, GPT-5-mini, GPT-4.1, o3, o4-mini, etc. |
| DeepSeek | DeepSeek-Chat (V3.2), DeepSeek-Reasoner, etc. |

API keys are stored exclusively in the browser's `localStorage` and are never uploaded to any server.

### 📝 Additional Tools

- **Title Workshop**: Automatically generates three styles of journal paper titles (colon-style, question-style, declarative) based on the elevated text
- **Simulated Reviewer (Reviewer 2)**: Critiques the output from a strict peer-reviewer's perspective — identifies logical weaknesses, proposes alternative explanations, and delivers an overall verdict
- **History**: Automatically saves recent inputs for quick recall

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm (or any compatible package manager)

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/your-repo/concept-forge.git
cd concept-forge

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Production Build

```bash
npm run build
npm run preview   # preview the production build locally
```

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **Onboarding**: Driver.js (guided tour on first visit)

## 📖 How to Use

1. **Select a Discipline Lens** — Pick a preset or type in your own theoretical framework
2. **Configure the AI Engine** — Click the settings button in the top-right corner, choose a provider, and enter your API key
3. **Paste Your Raw Text** — Drop your draft, notes, or colloquial ideas into the input area (drag the handle to resize)
4. **Elevate** — Hit the "Start Elevation" button and wait for the three-level analysis
5. **Refine Further** — Use "Title Workshop" or "Simulated Reviewer" in the results panel to polish your work

## 📂 Project Structure

```
concept-forge-main/
├── index.html              # Entry HTML
├── package.json            # Project config & dependencies
├── vite.config.ts          # Vite build configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── public/                 # Static assets
└── src/
    ├── main.tsx            # Application entry point
    ├── App.tsx             # Core component (all business logic)
    ├── App.css             # Base styles
    └── index.css           # Tailwind directives + Driver.js theme overrides
```

## 🔑 Obtaining API Keys

| Provider | Link |
|----------|------|
| Google Gemini | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| OpenAI | [OpenAI Platform](https://platform.openai.com/api-keys) |
| DeepSeek | [DeepSeek Platform](https://platform.deepseek.com/api_keys) |

> 💡 **Tip**: DeepSeek offers excellent cost-efficiency and is recommended for heavy usage.

## 📄 License

This is a private project. All rights reserved.
