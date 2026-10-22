# CodeTogether — Version 1 Project Plan

**Created:** 20 October 2026  
**Status:** Local frontend foundation implemented on 22 October 2026 in `E:\CodeTogether`; backend integrations remain planned.  
**Current deadline:** Working prototype ready by the evening of **19 November 2026**, starting **20 October 2026**.  
**Student availability:** **3–4 focused hours/day**.  
**Purpose:** A shared working document for the student and mentor, from prerequisite learning to a working, evaluated web prototype.

**22 October frontend session:** Local editor/dashboard, three language modes, draft recovery, input/results previews, preferences, and source copy/download are implemented. See [frontend-plan.md](./frontend-plan.md), [README.md](./README.md), and [verification evidence](./docs/verification.md). This does not mark earlier learning or execution-feasibility tasks complete.

> We will explain each new concept using an analogy, then the basics, then its role in this application, and finally the implementation and failure cases. Finishing a checklist means understanding and demonstrating the result, not merely copying code.

## How we will use this document

- Work through the phases together. Complete a small learning exercise or implementation milestone before adding more scope.
- Update decisions here when we agree to change them. Do not silently expand V1.
- Use unchecked boxes for work that remains. A written plan is not evidence that a feature has been built or tested.
- Record uncertainties under **Open decisions**, and record meaningful changes in the **Decision log**.
- Use Phase 5's selected stack from the beginning. Its position at the end follows the requested document structure; we will not wait until the end to choose technologies.
- Planning the later phases now does not mean starting their implementation immediately.
- The one-month delivery track below is the current scheduling target. Longer phase estimates describe the original deeper implementation, not additional weeks to fit into this month.

## One-month delivery track — 20 October to 19 November 2026

### Time budget and honest feasibility

There are **31 calendar days** in this inclusive working window. At 3–4 hours/day that is **93–124 hours**, assuming work every day. Target about **3.5 hours/day, or 108.5 hours total**. Keep **17–19 November** as a 10.5-hour repair/rehearsal buffer; the preceding 28 days provide about 98 planned hours.

This is a stretch target for a mentored prototype, not a promise of full mastery or production security. If major web concepts are entirely new, expect to need implementation help. Deep prerequisite study, a custom sandbox platform, distributed WebSocket scaling, and the complete original feature set do not responsibly fit this budget.

The deadline does not justify skipping permission checks, source snapshots, or execution limits. Reduce infrastructure and optional features instead.

### Recommended scope adjustment for this deadline

**Recommended month route:** retain React/Monaco/Yjs, authentication, PostgreSQL persistence, two/three-person rooms, and all three languages. Integrate an **existing sandboxed execution engine such as Judge0** through our backend instead of implementing the original Docker/gVisor runner from scratch this month. This is a planning recommendation, not a claim that an execution service has already been selected, purchased, configured, or tested.

Judge0 supplies sandboxed compilation/execution and submission limits; hosting and available settings vary. Its job queue can avoid duplicating that infrastructure in our app. Verify the chosen endpoint, language builds, quotas, cost, and controls early. See [official overview](https://judge0.com/) and [submission documentation](https://ce.judge0.com/).

| Keep for the month | Defer beyond the deadline |
| --- | --- |
| Two/three members, one shared file per room | More room roles, multi-file workspaces, language switching |
| Python, C++, Java | Additional languages and package installation |
| Authenticated access, basic invitations, server-side member cap | Elaborate member-management UI and permission customization |
| Yjs edits, presence, connection state, ordinary reconnect | Full offline/reload recovery guarantees and advanced collaborative history |
| Durable collaborative state and accurate save feedback | Advanced update-log compaction and version-history interface |
| Immutable source/input snapshots and identifiable results | Live output streaming and advanced execution-history browsing |
| Preset execution controls enforced by the selected engine | Our own container runtime orchestration and build-artifact pipeline |
| Backend quotas and bounded submissions | Our own Redis/BullMQ scheduler if the engine already supplies the queue |
| Essential security/failure tests and a small measured load test | Multi-instance WebSocket ownership, sharding, and production-scale load claims |
| HTTPS deployment, setup instructions, report, demonstration | Kubernetes, extensive dashboards, custom alerts |

For this route, the detailed custom worker/gVisor design, separate-stage resource table, custom queue/outbox, and reaper tasks later in this document remain **reference/post-deadline work**. They are not secretly additional month requirements. The chosen engine's limits must be mapped and verified; its memory accounting and CPU-time settings are not automatically equivalent to Docker cgroup caps or CPU-rate quotas.

**Execution selection gate: 22 October.** Demonstrate a bounded Hello World in Python, C++, and Java on the candidate engine. Confirm how it bounds compilation, program memory/time, output/storage, tasks, and networking, and whether those controls meet our prototype threat model. Keep credentials backend-only. If self-hosting Judge0, review [security advisories](https://github.com/judge0/judge0/security/advisories), use a patched deployment on a separate disposable/restricted runner VM, and budget setup time. A public documentation/demo endpoint is not a guaranteed free production service.

If no suitable execution endpoint is available, record the blocker and revise the scope/deadline immediately. Do not discover the need for a new custom runner in the final week. If implementing the sandbox yourself is an academic requirement, this month route is unsuitable without additional time or a substantially smaller surrounding app.

Cancellation is optional for the month route unless the selected engine supports genuine cancellation that we can verify. Do not label local polling cancellation as stopping a remote program. Essential finite execution limits remain mandatory.

### Daily study/build routine

| Block | Time | Concrete outcome |
| --- | --- | --- |
| Learn today's concept | 30 minutes | Explain only the concept needed for today's task; no unrelated course binge |
| Implement one small slice | 120 minutes | A working feature or an isolated experiment |
| Test and debug | 45 minutes | Check success plus at least one relevant failure |
| Explain and record | 15 minutes | Commit working changes; note what works, what failed, and tomorrow's first action |

Total: **3.5 hours**. On a three-hour day, reduce implementation to 90 minutes; preserve testing. On a four-hour day, use the extra 30 minutes for the current blocker or catch-up. Breaks are outside these focused-hour totals. Pick repeatable clock times around college obligations rather than assuming a specific class timetable.

For a new concept, use analogy -> basics -> one experiment -> application. Learn advanced details when they are needed; three prerequisite days are an introduction, not mastery of every Phase 0 topic.

### Calendar and weekly deliverables

| Dates | Main phase | Required outcome by the end of the window |
| --- | --- | --- |
| 20–22 Oct | Phase 0: focused foundations and feasibility | Can trace one edit and one Run; tools work; execution engine feasibility checked |
| 22–26 Oct | Phase 1: frontend | Start the core local workspace on 22 October; complete dashboard/forms, input/results layout, and three language modes by 26 October |
| 27 Oct–2 Nov | Phase 2: accounts and collaboration | Authorized three-person room, live cursors, durable document, basic reconnect |
| 3–9 Nov | Phase 3: real execution integration | All three languages run through the backend with fixed snapshots and verified policies |
| 10–14 Nov | Phase 4: correctness and security tests | Important races, failures, quotas, and authorization checks pass; small load evaluation recorded |
| 15–16 Nov | Phase 5: deployment and documentation | Remote demonstration works over HTTPS/WSS; setup/report/demo draft complete |
| 17–19 Nov | Protected buffer | Repair, rehearse, capture evidence, and prepare final delivery; no new features |

The calendar groups work by its main phase. Small risk checks happen earlier: execution feasibility on 22 October, login/deployment feasibility in week one, and a first remotely deployed skeleton by 2 November. Do not leave infrastructure discovery until 15 November.

### Day-by-day work plan

| Day | Date | Main task | Evidence to finish the day with |
| --- | --- | --- | --- |
| 1 | 20 Oct | Review scope, draw components, trace one edit and one Run; check JavaScript baseline | An explanation in your own words and a short list of knowledge gaps |
| 2 | 21 Oct | Learn essential browser/API/async/React concepts through a tiny exercise; establish repository and environment | A page calling a small API, with loading/error states |
| 3 | 22 Oct | Review frontend priorities and start the core local workspace; record execution-engine feasibility status separately | Local frontend progress and a clear record of any unverified engine/hosting controls; no implied completion of the original feasibility gate |
| 4 | 23 Oct | Agree desktop wireframe; build editor-page layout and navigation | Local dashboard and room shell |
| 5 | 24 Oct | Embed Monaco; configure Python/C++/Java modes and fixed file names | Real editable local source in each mode |
| 6 | 25 Oct | Build input/output/details panels and room-creation form | Mock execution states clearly identified as mock |
| 7 | 26 Oct | Finish essential loading/error states; test responsive layout; check OAuth callback configuration | Local UI walkthrough; login/hosting configuration feasibility recorded |
| 8 | 27 Oct | Integrate established login/session handling and database schema | Login/logout works; secrets stay out of the browser/source control |
| 9 | 28 Oct | Implement rooms, membership, and basic expiring invitations | Authorized joins work; fourth-member admission rejected atomically |
| 10 | 29 Oct | Wire Yjs and Monaco through an authorized room WebSocket | Two authenticated browsers edit the same file |
| 11 | 30 Oct | Add awareness and third participant; verify initialization happens once | Three users see named cursors/selections without duplicated starter code |
| 12 | 31 Oct | Persist collaborative state and load it safely; implement honest save feedback | Reload/application restart restores the saved document |
| 13 | 1 Nov | Test ordinary reconnect, room switching, and access rejection; repair integration | Concurrent edits converge after reconnect; nonmembers cannot subscribe |
| 14 | 2 Nov | Run week-two acceptance checks and deploy a minimal remote skeleton | Three-person collaboration milestone plus working HTTPS/WSS access |
| 15 | 3 Nov | Add execution records, immutable snapshots, backend adapter, and submission validation | Request ID/source/input/language stay tied together |
| 16 | 4 Nov | Integrate Python submission and asynchronous status/result retrieval | Real Python stdin/output and failure displayed |
| 17 | 5 Nov | Integrate C++ profile and compilation diagnostics | C++ success and compile-error cases work |
| 18 | 6 Nov | Integrate Java profile and validate resource compatibility | Java success, stdin, compile error, and runtime error work |
| 19 | 7 Nov | Apply server-controlled limit profiles, quotas, credential handling, and bounded result handling | Client cannot override profiles or consume unlimited pending work |
| 20 | 8 Nov | Map engine failures/statuses and resolve snapshot/result races | Old results cannot overwrite another execution; outages show platform errors |
| 21 | 9 Nov | Test full editing-plus-execution workflow for all languages | Complete three-language vertical slice; no mock execution remains |
| 22 | 10 Nov | Test same-position inserts, overlapping edits, paste, Unicode, and reconnect | Repeatable collaboration tests with final-state agreement |
| 23 | 11 Nov | Test configured finite time/memory/output behavior on an approved isolated test deployment | Evidence that control policies work; no attack testing against an unrelated public service |
| 24 | 12 Nov | Test membership races, forged requests, cross-room results, session handling, and revoked access | Essential authorization/security cases pass |
| 25 | 13 Nov | Test provider/database outages, request retries, persistence errors, and result recovery | No silent loss/false success or automatic resubmission of uncertain jobs |
| 26 | 14 Nov | Run small measured multi-room load test; fix the largest unresolved defect | Documented workload/latencies/limits; no unsupported scaling claim |
| 27 | 15 Nov | Finalize deployment configuration, TLS, private services, and restore/setup instructions | Repeatable deployed application; secrets/quotas configured |
| 28 | 16 Nov | Complete README, architecture/security notes, report draft, and end-to-end demonstration | Feature-complete prototype and a reproducible demonstration script |
| 29 | 17 Nov | Protected buffer: fix highest-impact failure and run the complete demo again | Stable build and updated evidence |
| 30 | 18 Nov | Rehearse with two/three accounts; prepare screenshots/video and viva explanations | You can explain each component and trace edit/Run flows without reading code |
| 31 | 19 Nov | Final smoke test, backup/export, dependency/config record, and delivery package | Prototype ready by evening; known limitations stated honestly |

### Deadline gates and what to do if behind

- **22 October:** execution feasibility and account/hosting access are resolved or explicitly blocked. Do not buy services without a deliberate budget decision.
- **26 October:** local UI works. Stop visual polishing after this gate; reserve later changes for usability defects.
- **2 November:** three-person authorized editing and persistence work. If behind, remove optional panels/history/member-management polish and use the buffer; keep permission/capacity correctness.
- **9 November:** real execution works in Python, C++, and Java. If behind, stop adding optional UI behavior. Do not drop a required language silently or replace isolated execution with a host-process shortcut.
- **16 November:** freeze features. Deployment and report must already exist; only repair and rehearse afterward.
- **19 November:** deliver the tested prototype with limitations. Failed essential isolation/authorization is a blocker, not a cosmetic issue to hide in the report.

If a task is blocked for more than one focused session, record the exact failure and work through it with the mentor. Do not lose several days silently. A missed day uses buffer capacity; it does not make the remaining work disappear. If more than two days behind by 2 November, revise the target explicitly.

### Minimum month acceptance checklist

- [ ] Two- and three-account rooms edit one shared file correctly; fourth membership rejected.
- [ ] Named live cursors/selections, ordinary reconnect, and room access checks work.
- [ ] Saved collaborative content survives reload and service restart; save failures are visible.
- [ ] Python, C++, and Java execute through the backend/selected engine; submitted source/input are fixed.
- [ ] Preset controls are actually supported and verified; credentials stay server-side; abuse admission is bounded.
- [ ] Compiler/runtime/limit/platform failures are distinguishable; results belong to execution IDs.
- [ ] The application works over HTTPS/WSS and passes the documented demonstration.
- [ ] Setup instructions, test evidence, architecture/security explanations, and known limitations are ready.

This checklist defines the accelerated prototype. The full custom-runner acceptance checklist later remains a deeper follow-up target. Reuse must be acknowledged in the report: integrating an execution engine is not the same contribution as implementing its sandbox.

## Contents

0. [One-month delivery track](#one-month-delivery-track--20-october-to-19-november-2026)
1. [Product scope and working decisions](#product-scope-and-working-decisions)
2. [Phase 0 — Prerequisites and project understanding](#phase-0--prerequisites-and-project-understanding)
3. [Phase 1 — UI, UX, and frontend](#phase-1--ui-ux-and-frontend)
4. [Phase 2 — Application logic, authentication, collaboration, and data flow](#phase-2--application-logic-authentication-collaboration-and-data-flow)
5. [Phase 3 — Isolated execution with preset limits](#phase-3--isolated-execution-with-preset-limits)
6. [Phase 4 — Correctness, security validation, reliability, and scaling](#phase-4--correctness-security-validation-reliability-and-scaling)
7. [Phase 5 — Final stack, integration, and working prototype](#phase-5--final-stack-integration-and-working-prototype)
8. [Open decisions and decision log](#open-decisions-and-decision-log)
9. [Reference material](#reference-material)

## Product scope and working decisions

### What we are building

A browser application where **two or three authenticated users edit the same code document**, see each other's cursors and selections, and execute a captured version of that code in a restricted server environment. V1 supports **Python, C++, and Java**.

**Analogy:** the room is a shared notebook; each browser has a copy; the collaboration system reconciles changes; an execution worker is a separate laboratory where a photograph of the notebook is tested.

### V1 scope

| Area | V1 decision |
| --- | --- |
| Group size | Maximum three member accounts per room, including its owner. Two-person and three-person collaboration are required demonstration cases. One member can prepare a room before others join. |
| Shared content | One shared source file per room. Everyone in that room edits the same document. |
| Languages | Python, C++17, and Java 21 language profiles. Exact maintained runtime/compiler builds will be pinned during implementation. |
| Language selection | Select a language when creating a room. It remains fixed for that room in V1; create another room for another language. This avoids accidental shared-code replacement. |
| Source filenames | `main.py`, `main.cpp`, or `Main.java`, selected by the server's language policy. |
| Identity | Sign in using an established identity provider integration; no anonymous execution. |
| Roles | Owner and editor. Both can edit and run; the owner manages invitations and members. Read-only viewers are deferred. |
| Collaboration | Yjs CRDT, Monaco editor binding, and a compatible authenticated WebSocket service. |
| Presence | Names, colors, cursors, selections, and connection status; presence is temporary. |
| Execution | Each user can submit the shared document snapshot visible in their browser. Every attempt gets an isolated environment. |
| Input | A local standard-input field. Its submitted value is stored with that execution. |
| Results | Room members can inspect execution results and their associated source/input snapshots. Each user independently selects which execution to inspect. |
| Storage | Durable collaborative state, room permissions, execution snapshots, and bounded results. |
| Deployment | Application environment separated from a dedicated Linux execution VM. |
| Initial audience | Access-controlled major-project prototype; no claim of production-grade hostile multi-tenancy. |

**The room is shared; an execution is a separate immutable job.** If two people click Run, they create two jobs. They do not overwrite each other's output. A room is not a container, and the three-person room limit is not a limit on the whole service.

### Explicitly outside V1

- More than three room members, multi-file projects, shared terminals, interactive shells, debugging, arbitrary package installation, user Dockerfiles, and repository execution.
- AI assistance, voice/video chat, chat messaging, rich comments, Git integration, and collaborative whiteboards.
- Full offline application availability, multi-region deployment, Kubernetes, and custom OT/CRDT implementations.
- Automatic grading against hidden test cases. V1 executes code and displays results; it is not yet a complete online judge.
- Language switching that resets an active shared document, advanced version-history UI, and viewer roles.

### Non-negotiable engineering requirements

1. Concurrent editing uses incremental collaborative updates, not last-writer-wins replacement of whole files.
2. Permissions are checked on the server for HTTP requests and WebSocket traffic.
3. Source, input, language policy, and runtime-image identity are fixed for each execution attempt.
4. Compilation is untrusted work and is isolated and bounded too.
5. CPU rate, memory, wall time, task count, output, storage, and aggregate admission each have separate controls.
6. User code never runs inside the API process or collaboration process.
7. User code receives no Docker socket, application secrets, database credentials, or uncontrolled host mounts.
8. Resource limits and cleanup are tested on the deployed runtime, not assumed from configuration files.
9. No architecture can promise that compromise is impossible. We will make specific containment claims supported by tests, keep software patched, and describe residual risks honestly.

## Phase 0 — Prerequisites and project understanding

**Goal:** Build enough understanding that every later step can be explained and reasoned about. Learn in small exercises rather than delaying all building until an entire course is finished.

**Original full-depth estimate:** 2–4 weeks at 10–15 focused hours per week. **Current month allocation:** 20–22 October for the essentials, followed by learning the relevant basics during implementation. This is not a claim that three days covers all prerequisite mastery.

### 0.1 Must-know foundations

| Topic | Analogy and basics | Why it matters | Small exercise | Free resource |
| --- | --- | --- | --- | --- |
| HTML and CSS | HTML is a room's structure; CSS arranges and decorates it. Learn forms, layout, flex/grid, sizing, and responsive design. | Editor page, dialogs, dashboard, readable panels. | Build a static editor page with an input panel. | [MDN web curriculum](https://developer.mozilla.org/en-US/curriculum/) |
| JavaScript | The behavior attached to the interface. Learn functions, arrays, objects, modules, exceptions, promises, and `async/await`. | Browser logic and the recommended backend. | Validate a form and call an API with loading/error states. | [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) |
| TypeScript | Labels that help catch mismatched data before running the program. Learn interfaces, unions, narrowing, and typed functions. | Safe handling of room, permission, job, and result data. | Model queued/running/completed execution states. | [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) |
| React | Build the interface from cooperating components with state and lifecycle. | Create/dispose editor instances, bindings, connections, and dialogs correctly. | Build a local editor screen without networking. | [React Learn](https://react.dev/learn) |
| HTTP and browser security | A request is a form handed to a reception desk. Learn requests, responses, status codes, cookies, origins, and TLS. | Login, room management, execution submission, and authorization. | Create and retrieve a record through an API. | [MDN HTTP overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview) |
| Backend and event loop | A receptionist coordinates many requests; lengthy work must not block the desk. | The API must remain responsive while programs execute. | Compare a slow request with background processing. | [Node.js blocking versus nonblocking](https://nodejs.org/en/learn/asynchronous-work/overview-of-blocking-vs-non-blocking) |
| WebSockets | An open telephone line rather than a separate letter for every message. | Continuous edits and presence updates. | Exchange messages between two browser sessions. | [MDN WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) |
| SQL and transactions | Structured records, with a transaction making a group of changes succeed or fail together. | Membership caps, durable documents, execution records, and race prevention. | Atomically admit one member to the final available room slot. | [PostgreSQL tutorial](https://www.postgresql.org/docs/current/tutorial.html) |
| Authentication and authorization | An ID establishes who you are; an access card determines which rooms you can enter. | Login alone must not grant room access. | Reject a logged-in nonmember's room request. | [OWASP authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) |
| Linux processes and permissions | A running program has an identity, resources, files, and child processes. | Understand signals, process trees, non-root users, and cleanup. | Start/stop a process and inspect permissions. | [Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/) |
| Docker basics | An image is a prepared workspace; a container is a running environment created from it. | Understand images, mounts, networking, startup, and removal. | Run a fixed trusted program under resource limits. | [Docker container concepts](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/) |
| Git and environment configuration | A recorded change history and explicit environment settings. | Reproducible development and controlled deployment. | Make a branch, review a diff, and keep secrets untracked. | [MIT Missing Semester](https://missing.csail.mit.edu/) |

### 0.2 Concepts to learn alongside the relevant feature

| Concept | First explanation | Learn before |
| --- | --- | --- |
| Replica, concurrency, convergence | Separate copies can change without knowing about each other; merging should make them agree. | Shared editing. |
| OT versus CRDT | Adjust position-based instructions versus merge structured changes with stable identities. | Choosing and explaining collaboration. |
| Presence and relative positions | Temporary pointers attached to text, rather than permanently saved cursor coordinates. | Remote cursor implementation. |
| Queue, worker, backpressure | Limited laboratory workstations and a bounded waiting line. | Execution integration. |
| Namespaces, cgroups, capabilities, seccomp | Separate views, resource budgets, restricted powers, and syscall filtering. | Running untrusted code. |
| Compiler versus runtime | C++ and Java need compilation before execution; both stages consume resources. | Language adapters. |
| Idempotency, retries, leases | Repeated delivery and crashed workers must not create conflicting final records. | Worker recovery. |
| Persistence and acknowledgements | Seeing a change is different from knowing it is durably stored. | Saved indicators and recovery. |
| Metrics and load tests | Measure a defined workload rather than guessing capacity. | Performance claims. |

### 0.3 Our learning method

For each new concept: explain the analogy, draw one example, predict behavior, run a small experiment, inspect a failure, and then connect it to CodeTogether. Advanced proofs and large-scale infrastructure are not entry requirements.

### Phase 0 checklist and exit criteria

- [ ] Explain browser, API, database, collaboration service, queue, worker, and sandbox in plain language.
- [ ] Build a small form-to-API exercise with validation and errors.
- [ ] Exchange messages between two browser sessions and demonstrate a disconnect.
- [ ] Explain why WebSockets alone do not merge edits.
- [ ] Explain authentication versus authorization.
- [ ] Explain a process, a container, and the difference between CPU rate and elapsed time.
- [ ] Read, run, and modify a small program in each supported language; know Java's `Main` entry point convention.
- [ ] Review the V1 scope and record any agreed changes below.

**Expected output:** a shared glossary, completed small exercises, and an agreed scope. No requirement to understand CRDT proofs or Docker internals completely at this point.

## Phase 1 — UI, UX, and frontend

**Goal:** Design all V1 screens, interactions, and failure states, then build them using local/mock data before connecting the systems.

**Original full-depth estimate:** 1–2 weeks. **Current month allocation:** 22–26 October, starting with the core workspace today and deferring optional polish. See [the frontend build plan](./frontend-plan.md). Earlier execution-feasibility work remains open until separately verified.

### 1.1 Screens and journeys

1. **Sign in:** project name, short purpose, and one clear sign-in action. Preserve the intended invitation destination through login.
2. **Dashboard:** list rooms the user belongs to; show room name, language, role, and Open. Place Create room above the list.
3. **Create room dialog:** room name and Python/C++/Java selector. State that language is fixed for this room in V1. Owner is the initial member.
4. **Invitation acceptance:** show the intended room, sign-in requirement, and explicit invalid/expired/full-room outcomes.
5. **Editor room:** shared code, participants, input, execution controls/results, connection status, and persistence status.
6. **Invite/member dialog:** owner can create a short-lived invitation, copy its link, inspect members, and revoke/remove access.
7. **Access/error states:** room not found, permission denied, session expired, room full, and unavailable service.

### 1.2 Desktop wireframe

```text
+----------------------------------------------------------------------------+
| CodeTogether   < Rooms   Sorting Practice      [A] [B] [C]  [Invite] Account |
+----------------------------------------------------------------------------+
| main.cpp   C++17   Connected   Saved                         [Run]           |
+-----------------------------------------------+----------------------------+
|                                               | Standard input             |
|  1  #include <iostream>                       | [local input field]        |
|  2  int main() {                              |                            |
|  3      std::cout << "Hello";                  +----------------------------+
|  4  }                                         | Executions   [Run #12 v]    |
|                                               | By Asha - Running [Cancel] |
|               SHARED EDITOR                   | [Output] [Errors] [Details]|
|          colored cursors/selections           |                            |
|                                               | selected execution result  |
+-----------------------------------------------+----------------------------+
```

The editor gets most width. Input/results share the right panel because they belong to execution. On narrow screens they move below the editor. No file explorer for a one-file product. Labels such as language and Saved must not look like buttons.

### 1.3 Control behavior

| Control | Behavior and placement |
| --- | --- |
| Create room | Dashboard primary action; validates the form and prevents duplicate submissions. |
| Open | Room card; fetches access-controlled room metadata, then starts synchronization. |
| Rooms | Editor header; returns to dashboard and disposes room listeners/bindings. Warn if leaving would discard unpersisted local changes. |
| Invite | Owner-only header control; opens invitation/member dialog. |
| Copy link | Copies a server-created invitation; never treats an ordinary room URL as authorization. |
| Participant avatar | Shows identity and online state. A participant is an account, not an arbitrary awareness name. |
| Run | Enabled after initial synchronization, while API/session access is available, and within admission limits. Captures local source/input immediately. |
| Cancel | In the selected active job's panel; requester can cancel their own job, owner can cancel any room job. Cancellation can race with completion. |
| Execution selector | Selects a job by ID, requester, and timestamp; late results cannot overwrite a different selection. |
| Output / Errors / Details | Shows bounded stdout, stderr/compiler diagnostics, and outcome/snapshot metadata. Render output as text. |
| View submitted source | Details action showing the immutable source/input associated with the selected execution. |
| Sign out | Account menu; ends session and authorized live access. |

### 1.4 Shared versus local state

| Shared in the room | Local to each browser |
| --- | --- |
| Source document and fixed room language | Scroll position, theme, panel sizes, selected result tab |
| Temporary cursors, selections, participant presence | Standard input before submission |
| Accepted execution snapshots and results | Which execution is currently selected |
| Room membership and access changes | Loading indicators for that user's requests |

An execution's submitted input becomes visible with that room execution. A new result may add a notification, but it should not force another user away from the result they are inspecting.

### 1.5 Frontend state and accessibility

- Document: loading, synchronized, unsynced, saving, saved, offline, persistence error, access revoked.
- Execution: queued, compiling, running, cancellation requested, completed, compile error, runtime error, time limit, memory limit, output limit, cancelled, infrastructure error.
- Distinguish code errors from platform errors. Missing compiler capacity is not a user's compile error.
- Reconnect with backoff; display the current state rather than repeatedly interrupting typing with notifications.
- Keep editing responsive while requests are pending. Do not set the complete editor value on every render or remote message.
- Provide keyboard navigation, visible focus, descriptive labels, sufficient contrast, and names in addition to cursor colors.
- Dispose editor models, bindings, and providers when leaving rooms. Avoid duplicate subscriptions from component remounting.
- Source text belongs to the collaborative document; do not maintain a competing React string as its authority.

### Phase 1 checklist and exit criteria

- [x] Review wireframes and button placement together.
- [ ] Build the sign-in/dashboard/dialog/editor layouts with mock data.
- [x] Configure Monaco highlighting for all three language profiles.
- [x] Demonstrate input/results and captured-source viewing with clearly labelled local execution fixtures. Full job-history selection awaits real job integration.
- [ ] Demonstrate loading, offline, full-room, denied-access, and execution-error screens.
- [x] Check basic responsive and keyboard behavior; detailed evidence and audit limits are documented.
- [x] Ensure no mock Run result is presented as real code execution.

**Expected output:** a usable frontend shell plus an agreed interaction specification. Shared editing and execution become real in later phases.

## Phase 2 — Application logic, authentication, collaboration, and data flow

**Goal:** Turn the shell into a durable, authorized collaborative application. Define the entire data flow before integrating execution.

**Original full-depth estimate:** 3–4 weeks. **Current month allocation:** 27 October–2 November for the reduced delivery scope above; advanced persistence/offline/worker orchestration remains reference work.

### 2.1 OT or CRDT: choose Yjs CRDTs

**Lost-update story:** two students edit separate copies of an assignment; submitting complete replacements means the last submission erases earlier work. Sending replacements faster does not fix the merge rule.

**OT analogy:** instructions refer to queue positions; inserting someone at the front means later instructions may need their positions adjusted.

**CRDT analogy:** give items stable identities and merge changes according to shared rules, so moving positions do not destroy identity.

| Question | OT, e.g. ShareDB | CRDT with Yjs |
| --- | --- | --- |
| Core mechanism | Transform edits against concurrent edits | Merge structured changes using defined rules |
| Integration work | Mature options exist; editor/type integration matters | Available Monaco binding, providers, and awareness integration |
| Server model | Commonly a central operation coordinator; not an absolute OT limitation | Merge does not require a central total-order authority; our app still uses servers |
| Offline divergence | Supported by some systems, including ShareDB | Natural synchronization model; durable local storage remains separate work |
| Metadata | Operation history and transformation state | Identity/order/deletion metadata with storage overhead |
| Best fit here | Good if OT is the research focus | Selected for practical integration and recoverable collaboration |

**Decision:** use Yjs throughout the plan. Three users alone does not make a particular algorithm mandatory; ecosystem fit and reliable integration are the deciding factors. Do not combine OT and CRDT or implement either from scratch for V1.

Yjs encoded updates can be applied in different orders and repeatedly without duplicating their effects. This is a property of its update protocol, not a promise that all CRDTs need identical delivery behavior. Convergence does not guarantee valid code or intuitive intent for every overlapping replacement. See [Yjs update semantics](https://docs.yjs.dev/api/document-updates).

### 2.2 Components and responsibilities

| Component | Responsibility |
| --- | --- |
| React frontend | Screens, user interactions, local UI state |
| Monaco + y-monaco | Editing experience and mapping edits/selections to shared text |
| Browser Y.Doc / Y.Text | Local collaborative replica |
| Collaboration service | Authorized subscriptions, update handling, room synchronization, persistence integration |
| HTTP API | Accounts/session integration, rooms, invitations, execution requests and result access |
| PostgreSQL | Authoritative permissions, durable document state, snapshots and results |
| Redis + BullMQ | Bounded execution scheduling, worker coordination and retries |
| Runner service | Trusted execution orchestration on a separate machine |
| Restricted sandbox | Untrusted compilation or execution stage |

The API and collaboration service can share a Node.js application initially. They are logical modules, not a requirement for many microservices. Execution remains separate.

### 2.3 Identity, rooms, and capacity

- Use an established GitHub OAuth sign-in integration with a maintained library. Validate OAuth state; use secure server-side sessions and session rotation/revocation.
- Keep session identifiers in Secure, HttpOnly cookies with a deliberate SameSite policy. Use CSRF protections for relevant HTTP mutations and Origin validation for WebSockets.
- Validate room membership on reads, subscriptions, edits, Run, cancellation, and result retrieval.
- The server creates single-use invitations with random tokens, stored as hashes, expiry, revocation, and a restricted room role. Avoid logging invitation secrets.
- Accepting an invitation checks room capacity and adds membership atomically. Two simultaneous redemptions must not turn the three-member room into a four-member room.
- The owner counts as one member, including when offline. Reopening a browser does not create another membership.
- Proposed connection bound: at most two room sockets per account in a room. Multiple tabs count once in the participant list; their selections are separate connection state.
- Recheck/revoke established connections when sessions expire or membership changes. UI hiding is insufficient.
- Keep permissions in authoritative server/database records, never in client-editable Yjs data.

| Action | Owner | Editor |
| --- | --- | --- |
| Read/edit document and see presence | Yes | Yes |
| Submit code and inspect room results | Yes | Yes |
| Cancel own execution | Yes | Yes |
| Cancel another member's execution | Yes | No |
| Invite/remove members or revoke invitations | Yes | No |

### 2.4 Collaboration and initialization flow

```text
Sign in -> open room -> API checks membership -> load fixed language/metadata
    -> establish authorized room WebSocket -> load/synchronize Yjs state
    -> bind shared text to Monaco -> enable editing

Local edit -> Monaco binding -> local Y.Text -> encoded update -> server checks access
    -> accepted update reaches authorized peers -> peers merge -> bindings render changes
    -> persistence path records durable collaborative state
```

- Create starter content once through a controlled server-side room/document creation path. Joining clients do not each insert a template.
- A server serializes accepted processing for each room and records updates before acknowledging durability. Failed persistence must not be labelled Saved.
- We may show accepted changes to peers before durability for responsiveness, but then visibly distinguish synchronized from saved. For the simpler initial contract, persist before broadcasting/acknowledging accepted updates.
- Stock Yjs provider sync events do not constitute durable-save acknowledgements. Implement a small application acknowledgement/status mechanism with explicitly tested sequencing.
- Track each connection's submitted local changes until the relevant server durability acknowledgement. Saved means this client's relevant changes were confirmed, not that nobody else is typing.
- Use origin handling to avoid rebroadcast loops. Dispose the binding/provider on room change.
- Limit encoded message size, resulting document size, update rate, and per-room resource use. Bound expensive decoding/validation work; disconnect abusive clients rather than letting malformed updates consume unlimited API resources.

### 2.5 Presence, undo, and reconnects

- Awareness carries ephemeral names/colors/selections separately from the persistent document. Map display identities to authenticated connections; awareness claims are not credentials.
- Use document-relative cursor positions via the editor binding, not only line/column numbers.
- Start cursor throttling around 10 updates/second, then measure. Heartbeats/expiry remove stale connections; offline detection is not instantaneous.
- Implement user-aware undo with Yjs UndoManager and the binding's appropriate transaction origins; verify that undo does not remove another user's unrelated edit.
- Reconnect with exponential backoff and jitter (small randomness so every client does not retry together).
- Temporary offline edits may continue locally; Run is disabled while application access is unavailable. Persist pending Yjs state locally if promising recovery across a reload.
- On reconnect, reauthorize, recover the persisted document, then synchronize differences. Revoked users' updates are not accepted.
- Full offline app loading is deferred. Browser persistence and service-worker application caching are different features.

### 2.6 Durable document storage

Persist an encoded Yjs checkpoint plus incremental update records after an explicit checkpoint boundary. Plain text exports do not preserve the full collaborative identity/history needed to resume the same document.

```text
Stored checkpoint + committed updates after its boundary -> recovered Y.Doc
```

Use per-room sequencing and database transactions for compaction. Never delete updates newer than the checkpoint boundary. Evict an idle in-memory room only after confirming persistence. A state vector describes replica knowledge; it is not an execution identifier or a human-readable version number.

### 2.7 Run and result data flow

```text
Run click -> capture local source + input -> POST execution request
    -> API checks identity, room access, language policy, size and quotas
    -> store immutable execution + pending-dispatch record transactionally
    -> dispatcher publishes job using execution ID -> worker claims attempt
    -> restricted compile/run -> bounded result -> authenticated result interface
    -> database records outcome -> browser polls authorized execution endpoint
```

- Define Run as the requester's visible source at click time, even if others have not seen all those edits yet. Store that exact text; do not later substitute the live document.
- Derive allowed runtime configuration from the room's language policy. The browser cannot select arbitrary images, resource flags, host paths, or shell commands.
- Include a request idempotency key so retrying an interrupted submission does not create an accidental duplicate logical execution.
- Use an outbox/pending-dispatch record and retrying dispatcher so a crash between database commit and queue publication cannot permanently lose the job. Duplicate publication must be harmless to result ownership.
- Return `202 Accepted` and an execution ID; poll status initially. Output streaming is optional later.
- Source/input snapshots are immutable; results reference them by execution/attempt ID. Content hashes identify bytes, not synchronized global revisions.
- Prevent a late execution result from replacing a different selected result. Show requester, language, status, and submitted source.

### 2.8 Logical data model

| Record | Key information |
| --- | --- |
| users | Account ID, identity-provider subject, display name |
| sessions | User, expiry, revocation/session data |
| rooms | Owner, name, fixed language, creation time |
| room_members | Room, user, role; unique membership and transactional capacity constraint |
| invitations | Hashed token, room, expiry, use/revocation status |
| documents | Room, encoded checkpoint, checkpoint boundary |
| document_updates | Document, server sequence, encoded update, commit time |
| executions | Requester, room, immutable source/input/language, hash, policy version, request key, status |
| execution_attempts | Execution, attempt/lease ID, worker, image digest, stage, deadlines, outcome, bounded outputs |
| outbox | Execution dispatch event, publication/retry state |

Proposed retention: keep current collaborative state; keep the last 20 executions per room and delete older execution snapshots/results after 7 days. Enforce global storage quotas too. These are editable starting policies; retention must be disclosed and tested.

### 2.9 API outline

```text
GET    /api/me
POST   /api/logout
GET    /api/rooms
POST   /api/rooms
GET    /api/rooms/:roomId
POST   /api/rooms/:roomId/invitations
POST   /api/invitations/accept
DELETE /api/rooms/:roomId/invitations/:invitationId
DELETE /api/rooms/:roomId/members/:userId
POST   /api/rooms/:roomId/executions
GET    /api/rooms/:roomId/executions
GET    /api/executions/:executionId
POST   /api/executions/:executionId/cancel
WSS    /collaboration/:roomId
```

OAuth callback/session routes follow the selected integration. Internal worker claim/result endpoints use separate narrow service authentication. Execution IDs and room IDs never bypass authorization. Never expose Redis or the Docker API publicly.

### Phase 2 checklist and exit criteria

- [ ] Create/login/join/reopen flows work with server-side permissions.
- [ ] Two and three independently authenticated users can concurrently edit the same file.
- [ ] Fourth-member admission is rejected, including simultaneous invitation acceptance races.
- [ ] Cursors/selections work and participant identities are authenticated.
- [ ] Initial content appears once; refresh/reconnect do not duplicate it.
- [ ] Yjs state recovers after an application restart, including edits during overlapping saves.
- [ ] Saved indicators match durable acknowledgement, including a simulated database outage.
- [ ] Unauthorized/nonmember messages and revoked sessions are rejected.
- [ ] Execution API/outbox/status flows can be exercised with a fake worker, clearly marked as simulation.

**Expected output:** real collaboration and durable rooms, plus a defined execution contract ready for a real runner.

## Phase 3 — Isolated execution with preset limits

**Goal:** Execute all three languages without allowing ordinary runaway submissions to exhaust unrestricted host resources. Treat deliberate hostile behavior as part of the threat model.

**Original custom-runner estimate:** 3–4 weeks. **Current month allocation:** 3–9 November for the recommended existing-engine integration, with feasibility checked on 22 October. The custom Docker/gVisor implementation below is post-deadline unless we deliberately change the scope and timeline.

### 3.1 Isolation strategy

**Analogy:** a laboratory needs separated workstations, resource budgets, an external shutdown switch, and a building-level admission limit. A locked door alone does not provide all four.

- Use a dedicated Linux execution VM, separate from the application/database environment.
- Use Docker with gVisor's `runsc` runtime as the target sandbox. Plain Docker is an initial disposable local experiment, not the final hostile-code boundary.
- Pin trusted prebuilt language images by digest. Do not build images from user submissions or install packages during a job.
- Create fresh stage sandboxes for each attempt; no reusable dirty user environments.
- Namespaces separate resource views; cgroups enforce resource accounting/limits; dropped capabilities, seccomp, and non-root users restrict powers. Ordinary containers share a kernel.
- Keep runner credentials narrow and its network access limited. Sandbox escape could compromise the runner; do not put production database secrets on it.
- Confirm gVisor, kernel/cgroup configuration, CPU/memory/task limits, and language compatibility on the actual Linux host. Rootless Docker is useful where supported, but only if all required controllers and enforcement work.
- Firecracker and Kubernetes are outside V1. Judge0 is a fallback architecture only if we explicitly decide to integrate an existing execution platform instead of building the runner.

See [gVisor's security model](https://gvisor.dev/docs/architecture_guide/security/), [Docker integration](https://gvisor.dev/docs/user_guide/quick_start/docker/), and [rootless limit requirements](https://docs.docker.com/engine/security/rootless/tips/).

### 3.2 Threats and required controls

| Threat | Control to implement and test |
| --- | --- |
| Infinite computation | CPU rate quota plus external wall-time deadline |
| Sleeping/blocked input | Wall-time deadline; bounded supplied stdin followed by EOF |
| Fork/thread explosion | Task/PID cap, memory cap, whole-sandbox termination |
| Memory exhaustion | Hard cgroup memory budget, explicit swap policy, host capacity reserve |
| File/disk exhaustion | Read-only root/source, bounded scratch bytes/inodes, per-file cap, bounded artifact export |
| Output flooding | Combined stdout/stderr/diagnostic byte accounting and termination; bounded Docker logs/buffers |
| Network abuse | No sandbox external network, no host network, no published ports |
| File/secret access | No secrets or Docker socket; minimal fixed mounts; non-root user |
| Runtime/kernel exploit | gVisor, patching, reduced privileges, separate VM and network boundary |
| Host command injection | Fixed executable/argument arrays; source is a file, never host shell syntax |
| Cross-job contamination | Fresh environments, bounded artifact handoff, whole-process-tree cleanup |
| Many legal jobs | Account/room/global admission limits and worker concurrency bound |
| Worker crash | Leases, external cleanup process, attempt IDs and controlled retry |

### 3.3 Preset policy table

These are **initial configuration targets to validate**, not benchmark results. The server owns them; users cannot request larger values. The final report records the tested profiles and machine specification.

| Language/stage | Memory cap | Wall deadline | CPU rate ceiling | Task cap | Scratch cap |
| --- | --- | --- | --- | --- | --- |
| Python execute | 128 MiB | 5 s | 1 CPU equivalent | 64 | 32 MiB |
| C++ compile | 512 MiB | 20 s | 1 CPU equivalent | 64 | 64 MiB |
| C++ execute | 256 MiB | 5 s | 1 CPU equivalent | 64 | 32 MiB |
| Java compile | 768 MiB | 20 s | 1 CPU equivalent | 128 | 64 MiB |
| Java execute | 512 MiB | 5 s | 1 CPU equivalent | 128 | 32 MiB |

Additional starting policies:

- Source <= 64 KiB, stdin <= 16 KiB; enforce before expensive processing.
- Compiler diagnostics <= 128 KiB; execution stdout + stderr <= 64 KiB combined, counted as bytes. Exceeding the policy stops that stage.
- Exported build artifacts <= 16 MiB and a bounded count; scratch inode/file-count cap tested separately.
- No extra swap allowance where supported. Writable scratch consumes resources within the overall budget.
- Separate stage-start deadline of 10 s, a 45 s outer attempt deadline including setup/handoff, and a 10 s cleanup deadline before escalation/quarantine. These are proposed defaults to measure.
- One active execution per account across rooms, at most one additional pending request; two active attempts globally on the initial runner, at most 20 pending globally. Bound admission per room as well.
- Starting submission rate: 6 accepted executions per account per minute, subject to stricter active/pending/global limits. Reject excess with a clear retry response.
- Reserve host memory/CPU/storage for the worker, runtime, OS, and cleanup. Two Java compilation jobs require more than twice their nominal application heap.
- CPU quota is a rate, not a total CPU-seconds budget. If we later claim a strict CPU-time budget, measure aggregate job cgroup usage rather than relying on one process's CPU limit.

Docker has no automatic per-job wall deadline from `--cpus`; implement a host-side watchdog. Verify controller support and actual behavior. See [Docker resource constraints](https://docs.docker.com/engine/containers/resource_constraints/).

### 3.4 Language adapters and compilation

| Profile | Fixed source/entry contract | Isolated stages |
| --- | --- | --- |
| Python | `main.py`; standard library only in V1 | Execute using the fixed Python interpreter; isolated mode and no bytecode writes where appropriate |
| C++17 | `main.cpp`, normal `main()` entry | Compile with fixed `g++ -std=c++17` arguments, then execute the bounded generated binary in a fresh sandbox |
| Java 21 | `Main.java`, `public class Main`, no package declaration, standard `main` entry | Compile with fixed `javac --release 21 -proc:none` arguments, then run `Main` from the validated class directory |

- Compilation itself can be malicious/expensive. Never compile on the trusted application host.
- Use separate compile and execution sandboxes to apply different budgets cleanly. Both are associated with one attempt.
- Before artifact extraction, stop all compile-sandbox processes. Treat every generated file as untrusted; accept only bounded regular files in the expected artifact layout, reject symlinks/path escapes/devices, and validate relative paths before copying. Never execute artifacts on the host.
- Mount exported artifacts read-only into the execution sandbox. C++ executable storage must permit execution; a blanket `noexec` scratch design would break it. Keep unrelated scratch non-executable where practical.
- For Java, budget JVM native memory, class metadata, code cache, and threads in addition to heap. A proposed `-Xmx256m` under the 512 MiB execution cap is a starting tuning point, not a security boundary or total-memory guarantee. Bound the compiler JVM too.
- Java's filename/class contract is a product restriction; do not rewrite arbitrary Java code with fragile regular expressions. Return clear diagnostics for unsupported package/entry layouts.
- Preserve compiler errors separately from runtime stderr. Distinguish compile timeout/OOM/output limits by stage in the result.

See [GCC command options](https://gcc.gnu.org/onlinedocs/gcc/Overall-Options.html), [javac](https://docs.oracle.com/en/java/javase/21/docs/specs/man/javac.html), and [Java runtime options](https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html).

### 3.5 Worker lifecycle and results

```text
QUEUED -> CLAIMED -> [COMPILING for C++/Java] -> RUNNING -> SUCCEEDED
                         |                        |
                         +----> terminal failure <-+

Terminal outcomes:
COMPILE_ERROR, RUNTIME_ERROR, TIME_LIMIT, MEMORY_LIMIT,
OUTPUT_LIMIT, CANCELLED, INFRA_ERROR

TIME_LIMIT / MEMORY_LIMIT / OUTPUT_LIMIT include a stage field.
```

1. Claim an attempt with a unique lease/generation and record the image/policy versions.
2. Prepare only bounded source/input files in a private job directory.
3. Create the required restricted stage using fixed server arguments.
4. Supply bounded stdin, close it, and collect bounded output without unbounded in-memory accumulation.
5. Watch stage and outer deadlines from trusted code outside the sandbox. Terminate the entire sandbox, including children, on timeout/cancel/output excess.
6. Record exit code, stage, timestamps, OOM evidence, and bounded output. Exit code 137 alone does not prove OOM.
7. Remove containers, artifacts, directories, and temporary metadata on all outcomes. Do not retain unbounded Docker logs.
8. Finalize the result only if the lease/attempt is still current. Ignore stale worker updates.
9. A separate reaper detects expired leases and orphaned sandboxes. Quarantine the runner from new work if termination/cleanup cannot be confirmed.

Queue delivery can repeat after failures. Do not promise exactly-once execution; make state transitions and result publication idempotent. Retry only selected infrastructure failures after terminating/reconciling old attempts, not normal compile/runtime/time-limit failures. See [BullMQ delivery behavior](https://docs.bullmq.io/) and [idempotent jobs](https://docs.bullmq.io/patterns/idempotent-jobs).

### Phase 3 checklist and exit criteria

- [ ] Run basic programs and stdin examples in Python, C++, and Java through the real API/queue/worker path.
- [ ] Show compiler errors for C++/Java and runtime errors for all three.
- [ ] Confirm memory, CPU rate, task, wall-time, output, scratch, and network controls on the actual runtime.
- [ ] Confirm compilation is isolated and bounded.
- [ ] Confirm distinct users' runs cannot share writable execution state or overwrite results.
- [ ] Cancel queued and running jobs and demonstrate the completion/cancel race.
- [ ] Kill a worker during a job; demonstrate reaping and stale-result rejection.
- [ ] Show that malicious/runaway jobs do not freeze document editing under the tested workload.

**Expected output:** real, bounded execution in all three languages, with recorded resource and failure evidence. This establishes tested containment behavior, not proof against all unknown vulnerabilities.

## Phase 4 — Correctness, security validation, reliability, and scaling

**Goal:** Verify the designs from Phases 2–3 under concurrency and faults. Document a credible WebSocket scaling path without building unnecessary infrastructure for three-person rooms.

**Original full-depth estimate:** 2–3 weeks. **Current month allocation:** 10–14 November for essential correctness/security/failure tests and a small load evaluation. Distributed scaling is documented, not implemented.

### 4.1 Concurrent-edit validation

- [ ] Test two and three replicas inserting at the same position, overlapping deletion, replacement, paste, multiline edits, and Unicode.
- [ ] Deliver updates in different orders, duplicate them, delay them, and reconnect replicas; assert equal final text after the same accepted changes arrive.
- [ ] Test user-local undo/redo after remote edits; inspect semantics, not only text equality.
- [ ] Exercise two/three real authenticated browser sessions, independent cookies, cursor movement, room switching, refresh, and temporary disconnection.
- [ ] Restart the service and recover from checkpoint plus committed updates; test compaction with concurrent incoming edits.
- [ ] Test concurrent invitation redemption at the final seat and membership/session revocation on live sockets.
- [ ] Check listener cleanup and memory use across repeated room visits.

### 4.2 Security and abuse validation

- [ ] In a disposable runner, test loops, sleeping, excessive allocation, controlled task spawning, output floods, file floods, and network attempts in supported languages.
- [ ] Test compiler exhaustion and malicious artifact paths, including symlinks; never run attack workloads directly on the development host.
- [ ] Reject unauthorized HTTP requests, forged roles/identity claims, cross-room result access, invalid invites, and disallowed WebSocket origins.
- [ ] Test malformed/oversized/flooded collaboration messages with bounded server resource use.
- [ ] Confirm no sandbox secret exposure, Docker socket, broad host mount, host network, or elevated privileges.
- [ ] Confirm output is inert text and invalid encodings/control sequences cannot inject markup or break the UI.
- [ ] Test queue-full behavior, per-user quotas, and many rooms submitting simultaneously.
- [ ] Test database outage, Redis outage, dispatch retry, worker restart, full storage, and failed cleanup.

Security is not a Phase 4 add-on: controls are implemented in earlier phases. This phase supplies adversarial evidence and repairs gaps. Use [OWASP WebSocket guidance](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html).

### 4.3 Scaling WebSocket connections

**First distinction:** keeping rooms at three members does not limit the number of rooms. More users can mean more small rooms rather than more people editing one file.

**Analogy:** one teacher can supervise a few tables. More classrooms require both distributing tables and ensuring that each table still has one coherent set of notes.

#### Stage A — V1: one collaboration instance

- One authorized WebSocket endpoint, in-memory active room documents, durable storage, and bounded connection/message/document sizes.
- Heartbeats detect dead sockets; reconnect backoff/jitter prevents synchronized retry storms.
- Per-account/per-IP connection attempts are rate-limited; active connection counts are bounded.
- Configure reverse-proxy WebSocket upgrades, idle timeouts, TLS, and graceful shutdown.
- Evict idle documents after persistence. Monitor memory per active room and outbound buffering; disconnect chronically slow consumers and resynchronize them on reconnect.
- Do not block the Node.js event loop with execution, synchronous filesystem work, or unlimited CRDT parsing. Bound ingress and isolate expensive work if measurements justify it.

#### Stage B — after measuring: distribute room ownership

- Place multiple collaboration instances behind a load balancer.
- Route all connections for a room to its owning instance using room-based routing, not merely client/IP stickiness.
- Track ownership with a lease and fencing generation, so an old owner cannot keep writing after takeover. Fencing means storage rejects writes from an obsolete owner generation.
- Recover the room from durable state after owner failure; clients reconnect and exchange missing changes.
- A load balancer alone does not synchronize in-memory documents or solve persistence races.

#### Stage C — only if one room must span instances

- Use a tested compatible synchronization backend or implement authenticated update/presence distribution with loop prevention and a defined persistence owner.
- Redis pub/sub can distribute live updates but is not a durable replay log. Reconnect/failover must recover missed state from persistent Yjs data.
- Pub/sub alone does not define save acknowledgements, authorization revocation, ownership, or safe compaction.
- This is future design work, not a V1 implementation requirement.

#### Execution scaling is separate

Add bounded workers/runner VMs after measuring per-job peak resources. Global admission/concurrency must remain global across workers; a per-worker limit multiplied by many workers is not the same policy. Keep CPU/memory reserve and queue storage limits. Editing capacity and execution capacity have different bottlenecks.

### 4.4 Observability and load evaluation

| Area | Evidence to collect |
| --- | --- |
| Collaboration | Local-to-remote display latency, reconnect catch-up, active rooms/sockets, message sizes/rates |
| Persistence | Commit latency, save failures, update-log growth, recovery/compaction correctness |
| Execution | Queue wait, sandbox startup, compile/run time, peak accounted memory, output size, termination delay |
| Reliability | Expired attempts, retries, orphaned sandboxes, cleanup failures, resource leaks |
| Admission | Rejected submissions/connections and quota reasons |

Initial test scenarios: one two-user room, one three-user room, then 5 and 10 simultaneous three-user rooms with defined edit rates and submission patterns. These are test workloads, not promised capacity. Increase only when measurements justify it.

Record hardware, runtime/image versions, document sizes, active typing rate, run frequency, test duration, and p50/p95 results. Ninety-five percent of measured operations must be within the stated p95 duration. Do not call 100 idle sockets equivalent to 100 actively typing users.

### Phase 4 exit criteria

- [ ] Important test cases are reproducible and their outcomes are documented.
- [ ] No unresolved critical authorization, sandbox configuration, or unbounded-resource failure remains.
- [ ] Two/three-user editing and all language executions work together under the measured workload.
- [ ] Failure/recovery behavior is demonstrated, not inferred from happy-path operation.
- [ ] A scaling design and measured limitations are documented without pretending future infrastructure already exists.

**Expected output:** test evidence, repaired defects, a small performance report, and a documented scaling path.

## Phase 5 — Final stack, integration, and working prototype

**Goal:** Consolidate the selected technologies, deploy the integrated prototype, and prove the original requirements in an end-to-end demonstration.

**Original full-depth estimate:** 1–2 weeks. **Current month allocation:** 15–16 November, with deployment feasibility/prototype work starting earlier and 17–19 November protected for repair/rehearsal. The stack below describes the original custom-runner route; the deadline track substitutes an existing execution engine and its queue where appropriate.

### 5.1 Selected technology stack

| Layer | Selected choice | Why | Alternative if constraints change |
| --- | --- | --- | --- |
| Web frontend | React + TypeScript + Vite | One understandable browser application with typed interfaces | Vue + TypeScript |
| Styling | CSS modules and plain CSS design tokens | Small V1 needs consistent layout, not another large framework | Tailwind if it clearly improves our workflow |
| Code editor | Monaco Editor | Coding experience and an existing Yjs binding | CodeMirror 6 |
| Collaboration | Yjs + y-monaco | Shared text, cursor/selection integration, existing merge implementation | ShareDB if we deliberately change to OT |
| Transport | Compatible stable y-websocket client/protocol and authenticated server implementation | Reuse synchronization/awareness semantics | Hocuspocus after compatibility evaluation |
| Backend | Node.js supported LTS + TypeScript + Fastify | Shared language, structured routes and request validation | Express |
| Auth | GitHub OAuth with a maintained integration library + server-side sessions | Avoid custom password/account-recovery systems | Another OIDC provider |
| Persistent database | PostgreSQL with SQL migrations and parameterized queries | Transactions for permissions, updates, execution/outbox records | SQLite only for early local exercises |
| Execution queue | BullMQ + Redis | Worker coordination and bounded scheduling | PostgreSQL-backed job queue |
| Trusted worker | Separate Node.js/TypeScript service using a Docker API client | Fixed structured container configuration; shared result types | Another language if a specific requirement justifies it |
| Sandbox | Docker + gVisor/runsc on dedicated Linux VM | Practical additional isolation for untrusted programs | Judge0 integration if we explicitly reduce runner scope |
| Language images | Pinned Python, GCC/g++ C++17, and OpenJDK Java 21 profiles | Reproducible execution and fixed policy | Maintained equivalent builds after testing |
| Local infrastructure | Docker Compose for database/Redis/app support | Repeatable local development | Native services for small exercises |
| Browser tests | Playwright | Independent sessions and end-to-end behavior | Equivalent browser automation |
| Unit/protocol tests | Vitest or Node test runner, selected once during setup | Target merge integration, admission, state transitions, cleanup contracts | Equivalent lightweight runner |
| Load tests | k6 plus protocol-aware Yjs client harness | Generic sockets alone do not model collaborative edits | A small measured custom harness |
| Logs/metrics | Structured JSON logs, request/job IDs, basic Prometheus-compatible metrics | Diagnose the important data flows | Hosted tooling if budget permits |
| HTTPS/deployment | Caddy reverse proxy; application VM plus separate Linux runner VM | Manageable TLS and clear trust boundary | Equivalent container-capable hosting |

Pin mutually compatible packages and image digests at implementation time. Do not mix stable and experimental Yjs package lines. Neither a provider example server nor a BullMQ “sandboxed processor” automatically supplies the application authorization or hostile-code boundary we require.

### 5.2 Proposed repository layout

```text
plan.md
apps/
  web/                   # UI and collaboration client
  server/                # HTTP, auth, collaboration, persistence, dispatch
  runner/                # trusted orchestration and cleanup
packages/
  contracts/             # API/result types and validation schemas
infra/
  compose/               # local infrastructure
  runner-images/         # fixed language image definitions
  deployment/            # proxy, service and host configuration
tests/
  collaboration/
  browser/
  execution/
  load/
docs/
  architecture.md
  security.md
  evaluation.md
  demo.md
```

This is a proposed structure, not a request to create these application files during planning. Commit examples of environment variable names, never secret values.

### 5.3 Deployment and operational tasks

- [ ] Choose host specifications and budget; verify the runner supports the selected gVisor platform and required cgroup controllers.
- [ ] Deploy app/API/collaboration over HTTPS/WSS with private database/Redis access.
- [ ] Deploy the runner separately with no public execution/Docker endpoint; narrowly authorize worker claim/result traffic.
- [ ] Configure secrets, session expiry, OAuth redirect URLs, origins, quotas, image digests, and resource profiles.
- [ ] Apply migrations; configure database backups and test a restore.
- [ ] Configure service restarts, readiness checks, graceful draining, reaper startup, and alerts for failed cleanup/storage exhaustion.
- [ ] Verify limits again on the deployed machine. Windows development via WSL2/Docker Desktop does not prove Linux production enforcement.
- [ ] Document installation, troubleshooting, known limitations, and how to reproduce tests.

### 5.4 Final prototype acceptance demonstration

1. Owner signs in and creates a Python room. A second account joins; both edit simultaneously and see cursors.
2. A third account joins. All three edit, including the same line; the document converges. A fourth account cannot become a member.
3. Refresh/restart and recover saved content. Disconnect/reconnect a browser and show the documented behavior for pending changes.
4. Each member submits a different run snapshot/input while editing continues. Results remain tied to the correct requester and snapshot.
5. Create C++ and Java rooms and demonstrate successful compilation/execution, stdin, and compile/runtime diagnostics.
6. Submit controlled runaway/memory/output workloads and show the enforced outcomes while collaboration stays responsive under the tested capacity.
7. Cancel a queued and a running job. Restart a worker and demonstrate cleanup/recovery without accepting stale results.
8. Attempt unauthorized room/result access and demonstrate rejection.
9. Show the measured evaluation, environment specification, and remaining limitations.

**Definition of done:** a working deployed prototype passes these scenarios; code, setup instructions, configuration policies, test evidence, and an explanation of trade-offs are available. A video of a happy-path demo alone is insufficient.

### 5.5 Realistic execution order and timeline

| Milestone | Main dependency | Outcome |
| --- | --- | --- |
| Learn and agree scope | Phase 0 | Can explain the components and basic data flow |
| Build local frontend | Phase 1 | Real local editor, mock network/execution states |
| Add collaboration and accounts | Phase 2 | Durable authorized two/three-user rooms |
| Add Python execution first | Phase 3 foundation | Real queue/runner/lifecycle |
| Add C++ and Java adapters | Tested execution foundation | All three required V1 languages |
| Validate faults and load | Phase 4 | Evidence for correctness and containment |
| Deploy and demonstrate | Phase 5 | Integrated prototype and report |

The original custom-runner learning plan estimated **12–19 weeks at 10–15 focused hours/week**. The current deadline is **19 November 2026**, with **3–4 hours/day** available. Follow the one-month delivery track at the top for the reduced prototype and recommended existing-engine route; do not treat the original full-depth checklist as achievable merely by compressing its dates. Required languages and essential isolation/authorization remain in scope.

## Open decisions and decision log

### Open decisions to discuss while planning

These do not block writing this plan. Defaults above keep it concrete until we revise them.

- [ ] Is room language fixed at creation acceptable, or is safe shared language switching important enough to expand V1?
- [ ] Confirm owner/editor-only roles; add viewers only if they serve a clear requirement.
- [ ] Confirm room-wide visibility of submitted input/source/results and retention policy.
- [ ] Confirm temporary offline editing and whether pending state must survive browser reloads in V1.
- [ ] Confirm GitHub login is suitable for intended students/examiners.
- [x] Record the requested project window: 20 October–19 November 2026, with 3–4 focused hours/day. The university's formal submission date is still unconfirmed.
- [ ] Confirm the recommended existing-engine route for the deadline, its hosting/budget, available language builds, and enforceable controls by 22 October.
- [ ] Record access to a suitable Linux runner if self-hosting; do not assume hosting or API access is already available.
- [ ] Validate resource targets, especially Java startup/heap/native memory and compiler requirements under gVisor.

### Decision log

| Date | Decision | Reason/status |
| --- | --- | --- |
| 2026-10-20 | V1 supports two/three collaborators and Python, C++, Java | User requirement; replaces the earlier Python-only starting-scope proposal |
| 2026-10-20 | Select Yjs CRDT for the rest of the architecture | Practical editor binding, synchronization and awareness ecosystem |
| 2026-10-20 | Every run uses an immutable source/input snapshot | Editing may continue before the queued job starts |
| 2026-10-20 | Isolate compilation as well as execution | Compiler work is attacker-influenced and resource-consuming |
| 2026-10-20 | Separate execution VM; target Docker + gVisor | Reduce host-kernel exposure and the consequences of runner failure |
| 2026-10-20 | Keep room language fixed and one file per room | Proposed V1 scope control; revisable together |
| 2026-10-20 | Start with one collaboration instance; document room-based scaling | Three-person rooms do not require premature distributed ownership |
| 2026-10-20 | Target prototype readiness on 19 November with 3–4 hours/day | User's one-month deadline and stated availability; about 93–124 maximum calendar-window hours |
| 2026-10-20 | Recommend an existing execution engine for the month route | Scope recommendation, not yet a purchased/configured service; custom runner remains a follow-up target |
| 2026-10-20 | Protect 17–19 November for repair and rehearsal | Do not spend the entire month adding features and leave no delivery buffer |
| 2026-10-22 | Start frontend with an editor-first local milestone today | User request; separate required UI from optional polish and mark simulated states honestly. GitHub publication is not performed by planning. |
| 2026-10-22 | Move the project to E:\CodeTogether and implement the first frontend milestone | User-specified directory; prior plan preserved, videos untouched. Real local editor and draft recovery verified; no authentication/collaboration/execution backend claimed. |

### First planning session

Start at Phase 0: draw a browser, API, collaboration service, database, queue, worker, and sandbox. Trace one keystroke and one Run click. Then explain why fast delivery is different from correct merging, and why CPU throttling is different from a deadline. We will expand the relevant checklist as each concept becomes clear.

## Reference material

Technology references checked on 20 October 2026. Learning-resource links are provided in Phase 0. Recheck release compatibility and security advisories before installing or deploying.

- [Yjs document updates](https://docs.yjs.dev/api/document-updates)
- [Yjs awareness](https://docs.yjs.dev/getting-started/adding-awareness)
- [Yjs relative positions](https://docs.yjs.dev/api/relative-positions)
- [Yjs UndoManager](https://docs.yjs.dev/api/undo-manager)
- [Monaco binding](https://github.com/yjs/y-monaco)
- [y-websocket package and compatibility guidance](https://github.com/yjs/y-websocket)
- [ShareDB OT features](https://share.github.io/sharedb/)
- [Docker resource limits](https://docs.docker.com/engine/containers/resource_constraints/)
- [Rootless Docker enforcement requirements](https://docs.docker.com/engine/security/rootless/tips/)
- [gVisor security model](https://gvisor.dev/docs/architecture_guide/security/)
- [gVisor with Docker](https://gvisor.dev/docs/user_guide/quick_start/docker/)
- [BullMQ](https://docs.bullmq.io/)
- [Idempotent queue jobs](https://docs.bullmq.io/patterns/idempotent-jobs)
- [OWASP WebSocket security](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html)
- [GCC command options](https://gcc.gnu.org/onlinedocs/gcc/Overall-Options.html)
- [Java compiler](https://docs.oracle.com/en/java/javase/21/docs/specs/man/javac.html)
- [Java runtime](https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html)
- [Judge0 overview and hosting options](https://judge0.com/)
- [Judge0 submission limits and asynchronous results](https://ce.judge0.com/)
- [Judge0 security advisories](https://github.com/judge0/judge0/security/advisories)
