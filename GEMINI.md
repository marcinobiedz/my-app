# Project Context: API Monitoring & Notification Service

## Core Directives
- **Language:** Always write code, logs, and variable names in English.
- **Communication:** Respond concisely in Polish.
- **Style:** No comments. Keep the code clean and surgical.
- **Coding Principles:**
  - **YAGNI:** Do not implement features until they are needed.
  - **DRY:** Avoid code duplication.
  - **Pure Functions:** Prefer deterministic functions with no side effects where possible.
  - **TypeScript:** Avoid all type casting (`as`, `<Type>`). This includes unnecessary casting like `false as boolean`. Use type guards, proper interfaces, or type inference instead.
- **Approach:** API-first. Avoid web scraping/browser automation unless explicitly requested. Use `fetch`.
- **Architecture:** 
  - `src/index.ts`: Main entry point with cron scheduler.
  - `src/apiService.ts`: Specialized module for external API integration.
  - `src/emailService.ts`: Specialized module for SMTP notifications.
- **Environment:** Use `.env` for all sensitive data (credentials, URLs, IDs).

## Technical Standards
- **Runtime:** Node.js with TypeScript (ESM).
- **Scheduler:** `node-cron`.
- **Notifications:** SMTP via `nodemailer` (e.g., Gmail App Passwords).
- **Validation:** Always verify API response structure before processing.

## Current Workflow
1. Fetch data from external API.
2. Log results to console.
3. (Optional) Send email notification based on business criteria.
