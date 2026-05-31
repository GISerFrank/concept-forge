# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.x     | ✅ Active support  |
| < 1.0   | ❌ No support      |

## Architecture & Data Privacy

ConceptForge runs entirely in the browser. User API keys and preferences are stored in `localStorage` only — no data is transmitted to any server other than the chosen LLM provider's API endpoint.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public issue
2. Email: asulbw25@gmail.com
3. Include a description and steps to reproduce
4. We will acknowledge within 48 hours and provide a fix timeline

## Scope

Security concerns we care about:

- API key exposure or leakage
- XSS via user input or LLM response injection
- Dependency vulnerabilities
- Unsafe handling of LLM outputs (prompt injection in rendered results)
