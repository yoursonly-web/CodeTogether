# CodeTogether

A collaborative code editor project for small groups working in **Python, C++, and Java**.

CodeTogether is being built as a B.Tech Computer Science major project. Its first complete version will let two or three people share one code file, see each other's cursors, and run a captured version of their code through an isolated execution service.

> **Development status: local frontend prototype.** The editor, workspace management, and browser draft saving work today. Authentication, real-time collaboration, server persistence, and code execution are still planned. The **Run** button is disabled, and the output examples are explicitly labelled UI previews.

## Preview

### Editor workspace

![CodeTogether local editor with source, standard input, and result panels](docs/screenshots/workspace.png)

<details>
<summary>Workspace dashboard and narrow layout</summary>

### Workspace dashboard

![CodeTogether local workspace dashboard](docs/screenshots/workspaces.png)

### Narrow layout

![CodeTogether workspace at a narrow screen width](docs/screenshots/workspace-narrow.png)

</details>

## Features available now

| Area | Implemented features |
| --- | --- |
| Code editor | Monaco Editor, Python/C++/Java syntax highlighting, line numbers, indentation, find and replace, and local undo/redo |
| Local workspaces | Create, search, and switch workspaces; each workspace keeps its own source code and standard input |
| Language profiles | Python with `main.py`, C++17 with `main.cpp`, and Java with `Main.java` |
| Draft saving | Debounced saving in browser storage, recovery after refresh, and visible saving/error states |
| Recovery safeguards | Validation of saved data; malformed drafts and detected changes from another tab pause saving until explicitly resolved |
| Input and result interface | Standard input field; Output, Errors, and Details tabs; labelled queued/running/success/compile-error/time-limit examples |
| Source snapshots | Capture and inspect the source/input associated with a UI example, even after the current editor changes |
| Editor preferences | Adjustable font size, word wrap, and focus mode |
| File actions | Copy source to the clipboard or download the active source file |
| Interface | Dark theme, responsive layout, keyboard-operable result tabs, and dialogs with focus management |

**Language profiles currently support editing only.** No compiler or interpreter is connected. C++17 is the intended C++ profile; actual runtime versions will be selected and verified during execution integration.

The participant and invitation controls explain the upcoming collaboration flow. They do not create online rooms or connect other users.

## Planned version 1 features

The target is a working prototype for **2–3 participants per room**, with a maximum of three members including the owner. Each room will contain one source file in one selected language.

### Accounts and room access

- GitHub sign-in with authenticated server sessions.
- Create a shared room and invite another participant.
- Enforce room membership and permissions on the server.
- Reject unauthorized room access and admission beyond the three-member cap.

### Real-time collaboration

- Shared editing through **Yjs**, using a CRDT to merge concurrent changes.
- A Monaco binding and authenticated WebSocket synchronization.
- Live participant presence, cursors, and selections through awareness messages.
- Visible connecting, connected, disconnected, and reconnecting states.
- Durable collaborative document storage and recovery after server restart.

Yjs is the selected collaboration approach. WebSockets carry messages; Yjs supplies the merge logic. Concurrent edits must converge when clients receive the same valid updates, although this cannot guarantee that overlapping edits produce logically correct code.

### Isolated code execution

- Run Python, C++, and Java through a backend execution adapter.
- Capture the submitted source, language, and standard input so a result always belongs to a specific submission.
- Show real queued, running, successful, compilation-error, runtime-error, and resource-limit results.
- Apply preset time and memory limits, bounded output, submission quotas, and concurrency limits.
- Validate the selected engine's process, filesystem, network, compilation, and runtime restrictions.
- Keep execution credentials and submitted programs outside the frontend and web application process.

For the one-month prototype, the plan recommends integrating an existing sandboxed execution engine, such as **Judge0**. The provider, runtime versions, hosting, and limit settings have **not** been configured or verified yet. A custom Docker + gVisor runner is later work.

### Reliability and delivery

- Test same-position edits, reconnects, room authorization, and persistent recovery.
- Verify execution limits with infinite loops, excessive allocation, process spawning, and output flooding in a controlled test environment.
- Record a small, measured load test.
- Deploy the integrated prototype over HTTPS/WSS and document setup and limitations.

## Later improvements

These are ideas for later development, not requirements for the first prototype:

- Version history, named checkpoints, and restoration.
- Owner/editor/viewer roles with finer permissions.
- Multi-file projects and additional languages.
- Larger rooms after measuring and improving capacity.
- Multiple collaboration server instances with room ownership and failover.
- Better offline recovery and conflict/reconnection guidance.
- A dedicated Docker + gVisor execution service if building a runner becomes a separate project goal.
- Richer execution history, cancellation, metrics, and performance dashboards.

Shared terminals, arbitrary package installation, user-provided container images, and a full debugger are outside the initial scope.

## Technology stack

### Implemented

| Layer | Technology |
| --- | --- |
| User interface | React 19 and TypeScript |
| Build tooling | Vite 7 |
| Code editor | Monaco Editor with `@monaco-editor/react` |
| Styling | CSS with responsive layouts |
| Icons | Lucide React |
| Local persistence | Browser `localStorage` with validated draft recovery |
| Automated checks | Node.js test runner, TypeScript, and Vite production build |

Monaco and its editor worker are bundled with the application. The interface optionally requests DM Sans from Google Fonts and falls back to system fonts.

### Planned backend

| Layer | Planned choice |
| --- | --- |
| API | Node.js, TypeScript, and Fastify |
| Shared editing | Yjs, `y-monaco`, and a compatible authenticated WebSocket service |
| Authentication | GitHub OAuth and server-side sessions |
| Database | PostgreSQL for accounts, membership, collaborative state, and execution records |
| Execution | Backend adapter to an existing sandbox engine; provider selection and validation pending |
| Job scheduling | Use the execution engine's queue initially; consider Redis/BullMQ if a separate worker service is needed |
| Deployment | HTTPS/WSS for the app; execution infrastructure separated from the application |

Backend choices describe the intended architecture, not installed services.

## How it works

### Current frontend

```text
Keyboard / workspace controls
             |
             v
     React application state
        |              |
        v              v
   Monaco Editor   Browser draft storage

Preview state selector --> labelled sample result + captured source/input

Run --> disabled until backend execution is connected
```

### Planned integrated application

```text
Browser A <--- authenticated Yjs/WebSocket sync ---> Collaboration service
Browser B <--- authenticated Yjs/WebSocket sync --->         |
Browser C <--- authenticated Yjs/WebSocket sync --->         v
                                                        PostgreSQL
                                                            ^
                                                            |
Browser -- Run snapshot --> Authorized API --> Execution engine / queue
                                 ^                       |
                                 |                 Isolated execution
                                 |                       |
                                 +--- bounded result ----+
                                 |
                                 +--> Result shown in the browser
```

The collaboration and API services are logical responsibilities; they can initially live in one backend deployment. Execution is a separate trust boundary. Presence is temporary session information; it is not the durable source document.

## Run locally

### Requirements

- **Node.js 22.12 or newer**. Node.js 24 was used to verify this milestone.
- **npm**, included with Node.js.
- A modern desktop browser.

Clone or download this repository. From its root directory, run:

```sh
npm ci
npm run dev
```

Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/) in your browser. The development server binds to your local machine.

On Windows, if PowerShell blocks `npm.ps1`, use:

```powershell
npm.cmd ci
npm.cmd run dev
```

No database, Docker installation, OAuth credentials, or execution service is required for the current frontend.

### Try the prototype

1. Open the default Python playground.
2. Edit the starter source and standard input.
3. Create another workspace with C++ or Java.
4. Refresh to check browser draft recovery.
5. Use **Preview states** to inspect the sample result panels.
6. Adjust word wrap or font size, try focus mode, and copy or download a file.

The preview selector does not evaluate your program.

## Commands and verification

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the frontend development server |
| `npm test` | Run the draft validation/recovery tests |
| `npm run typecheck` | Check TypeScript |
| `npm run build` | Type-check and build into `apps/web/dist` |
| `npm run preview` | Serve the production build locally, normally on port 4173 |

The frontend milestone was verified on **22 October 2026**: eight model tests passed, TypeScript and the production build passed, and manual browser checks covered editing, recovery, workspace navigation, sample results, dialogs, and responsive layouts.

The build currently reports a large Monaco bundle warning. Full cross-browser testing, a complete accessibility audit, multi-user correctness tests, and execution security tests remain future work.

See [verification notes](docs/verification.md) for the checks and their limits.

## Development roadmap

| Phase | Goal | Current status |
| --- | --- | --- |
| 0 — Foundations | Understand browser/server communication, React, CRDTs, persistence, and isolation | Learning and project design are ongoing |
| 1 — Frontend | Build the editor, local workspaces, input/results interface, and recovery | Local prototype implemented; backend integration pending |
| 2 — Application logic | Add authentication, authorized rooms, Yjs editing, awareness, and durable saves | Planned |
| 3 — Execution | Connect isolated Python/C++/Java execution with verified limits | Planned |
| 4 — Validation | Test concurrency, failures, authorization, resource limits, and measured load | Planned |
| 5 — Integration and deployment | Deploy the working prototype and complete the project documentation | Planned |

The build window is **20 October–19 November 2026**, based on roughly **3–4 focused hours per day**. This is a prototype target, not a production-readiness claim.

Detailed decisions and acceptance criteria are in [plan.md](plan.md) and [frontend-plan.md](frontend-plan.md).

## Project structure

```text
CodeTogether/
├── apps/
│   └── web/
│       ├── public/
│       ├── src/
│       │   ├── components/
│       │   │   ├── Dialog.tsx
│       │   │   └── WorkspaceEditor.tsx
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   ├── model.ts
│       │   └── styles.css
│       ├── package.json
│       └── vite.config.ts
├── docs/
│   ├── screenshots/
│   └── verification.md
├── tests/
│   └── model.test.mjs
├── .gitignore
├── frontend-plan.md
├── package-lock.json
├── package.json
├── plan.md
└── README.md
```

## Current limits and local data

- Drafts and preferences are saved under `codetogether.local.v1` in this browser's local storage. Another browser, browser profile, or origin has separate data.
- Clearing site data removes drafts. Download important files as an independent copy.
- Use one active editing tab. Detected external storage changes pause saving; the prototype does not merge browser tabs or devices.
- Each source file is limited to **64 KiB** and standard input to **16 KiB**, measured in UTF-8 bytes.
- Up to **12 local workspaces** are supported. This is unrelated to the future three-person room cap.
- The layout adapts to narrow screens, but a desktop browser is the intended coding environment.
- Local storage is not server persistence, account authentication, or a secret store.
- No submitted code is executed in this milestone.

## Repository contents

Commit source files, documentation, screenshots, package manifests, and `package-lock.json`.

The included `.gitignore` excludes installed dependencies, build output, local environment files, generated TypeScript metadata, scratch work, the archived original plan, and root-level video/archive files. Personal recordings are not application assets.

## License

A project license has not been selected yet. This repository does not currently claim an MIT or other open-source license. Dependencies retain their respective licenses.
