# AI Index – NipponLife

## AI Usage Rule
Before proposing any change:
1. Read DECISIONS.md
2. Respect AI_RULES.md
3. Use PROMPTS.md as reference

This file is the navigation index for the NipponLife AI system.

Its purpose is to help humans and AI agents quickly identify:

- which documentation (directive / skill) to use
- when to use it
- what scope it governs

All files listed here must obey the global rules defined in `AI_RULES.md`.

---

## Global Directive (Mandatory)

### AI_RULES.md

**Scope:** Global / System-wide  
**Purpose:**

- Defines stack, layout rules, output format
- Freezes typography and color system
- Defines Supabase as the single source of truth
- Defines authentication, RLS, and migration rules
- Overrides all other documentation unless explicitly stated

**When to use:**

- Always read first
- Must be referenced before any code, schema, or design change

---

## Core Project Documentation

### README.md

**Scope:** Project overview  
**Purpose:**

- High-level description of NipponLife
- Entry point for new contributors or reviewers

**When to use:**

- Understanding what the project is
- Context before diving into specific features

---

## Prompt & Interaction Rules

### PROMPTS.md

**Scope:** AI interaction patterns  
**Purpose:**

- Defines reusable prompt patterns
- Helps standardize how requests are made to the AI

**When to use:**

- When crafting or reusing structured prompts
- When refining how tasks are requested

---

## Tagging & Content Rules

### TAGS_GUIDE.md

**Scope:** Content taxonomy  
**Purpose:**

- Defines how tags should be structured and used
- Prevents inconsistent or duplicated tagging

**When to use:**

- When creating or modifying tags
- When working with content categorization

---

## Authentication & Debugging

### AUTH_ARCHITECTURE.md

**Scope:** Arquitetura de autenticação (referência portável)
**Purpose:**

- Referência canônica do stack de auth: Supabase SSR + Next.js App Router
- Código canônico pronto para copiar em novos projetos (supabaseClient, middleware, AuthContext, callback route)
- Regras de ouro: o que FAZER e o que NÃO FAZER, com justificativa dos bugs reais
- Guia passo a passo para adicionar novos providers OAuth (Google, GitHub, etc.)
- Checklist de verificação pós-implementação

**When to use:**

- Antes de implementar autenticação em qualquer projeto novo Next.js + Supabase
- Ao depurar problemas de sessão, loop de login ou deslogamento no reload
- Como referência para entender como cookies, middleware e AuthContext se conectam

---

### LOGIN_DEBUG_AUDIT.md

**Scope:** Authentication troubleshooting
**Purpose:**

- Documents known login/auth issues
- Tracks debugging steps and resolutions

**When to use:**

- When login or authentication problems occur
- Before attempting new fixes related to auth

---

## Feature-Level Directives (Skills)

### .gemini/share-buttons-implementation.md

**Scope:** Front-end feature  
**Purpose:**

- Defines the exact implementation of share buttons
- Tracks decisions, constraints, and final behavior

**When to use:**

- When modifying share functionality
- When reusing or extending share logic

---

## Statistics Module

### docs/statistics-module-implementation.md

**Scope:** Statistics system (data + UI)  
**Purpose:**

- Defines how the statistics module is structured
- Documents data sources, logic, and constraints

**When to use:**

- When changing statistics logic
- When adding new statistical features

---

### docs/admin-statistics-guide.md

**Scope:** Admin operations  
**Purpose:**

- Explains how admins interact with statistics
- Documents admin-specific workflows and permissions

**When to use:**

- When modifying admin dashboards
- When adjusting admin permissions or flows

---

## Operating Principles

- All `.md` files listed here are considered **directives (skills)**
- Directives are living documents and must be updated as the system evolves
- No directive may contradict `AI_RULES.md`
- After implementing changes, update the relevant directive
- Documentation is part of the system, not an afterthought

---

## Mental Model

- `AI_RULES.md` = Constitution
- `AI_INDEX.md` = Map
- Other `.md` files = Skills / SOPs
- Code & database = Execution layer

Read the map first. Obey the constitution. Execute with confidence.
