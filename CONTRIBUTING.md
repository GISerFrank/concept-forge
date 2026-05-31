# Contributing to ConceptForge / 贡献指南

Thank you for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/your-repo/concept-forge.git
cd concept-forge
npm install
npm run dev
```

## How to Contribute

### Reporting Bugs

Open an issue using the **Bug Report** template. Include reproduction steps and your environment info.

### Suggesting Features

Open an issue using the **Feature Request** template. Describe the problem and your proposed solution.

### Submitting Code

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes
4. Ensure the build passes: `npm run build`
5. Run the linter: `npm run lint`
6. Commit with a clear message (e.g. `feat: add streaming response support`)
7. Push and open a Pull Request

### Areas We'd Love Help With

- **i18n**: English UI translation and multilingual prompt optimization
- **New LLM providers**: Adding support for more backends (Claude, Ollama, etc.)
- **Prompt engineering**: Improving output quality for specific disciplines
- **Testing**: Adding unit and integration tests
- **Accessibility**: Improving keyboard navigation and screen reader support

## Code Style

- TypeScript strict mode
- Tailwind CSS for styling (no inline styles or external CSS unless necessary)
- Components in `src/` — keep related logic co-located

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `refactor:` — code change without feature/fix
- `chore:` — tooling, dependencies, config
