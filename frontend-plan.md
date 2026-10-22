# Frontend implementation plan

**Planning date:** 22 October 2026  
**Available time:** 3–4 focused hours today  
**Status:** Local frontend foundation implemented on 22 October 2026 in `E:\CodeTogether`; authentication, shared editing, and execution remain unconnected. See [verification evidence](./docs/verification.md).  
**Related plan:** [Overall project plan](./plan.md)

## 1. Today's outcome

Build a usable local frontend foundation: the editor screen, real local code editing, standard input, output/error/details panels, essential navigation, and clear states. Aim to finish the main workspace today; complete the remaining frontend flows by 26 October.

“Most of the frontend” is a useful target only if it means the core screen and local interactions. Complete authentication, reliable shared cursors, execution results, room capacity, and server save status require backend integration. A polished screenshot does not establish that those systems work.

The planning session does not mark prerequisites or the execution-engine feasibility check complete. Those remain open unless demonstrated separately. Starting frontend work today advances the original 23 October frontend start by one day.

## 2. Product decisions to preserve

- Two or three authenticated members collaborate in one room; maximum three member accounts including owner.
- Python, C++17, and Java profiles; one source file per room.
- Choose language when creating the room. The active room shows a language label, not an unrestricted language-switch button.
- Filenames: `main.py`, `main.cpp`, and `Main.java`. Java starter code uses `public class Main`.
- Owner and editor roles. Both edit/run; owner controls invitations/membership.
- Each Run captures a source/input snapshot; results belong to individual execution IDs.
- Shared code, participant presence, and room execution records; local input before submission, theme, pane size, scroll, and selected result.
- Cancellation remains optional until the chosen execution engine supports genuine termination. Do not add a decorative Stop button.
- No landing-page marketing project, file explorer, chat, video, AI assistant, terminal, debugger, or multi-file UI in this frontend milestone.

## 3. Priority system

| Priority | Meaning | Scheduling rule |
| --- | --- | --- |
| P0 | Essential workspace foundation | Build today before cosmetic extras |
| P1 | Required V1 frontend flows/states | Complete by 26 October, then connect backend features as scheduled |
| P2 | Useful frontend-only polish | Add selectively after P0/P1 work correctly |
| Deferred | Extra product scope or backend-heavy work | Keep out of this month unless we explicitly revise scope |

## 4. Required screens and components

| Screen/component | Priority | Required frontend behavior | Integration boundary |
| --- | --- | --- | --- |
| Editor workspace | P0 | Room/file identity, language, editor, input, result tabs, status area, primary Run position | Initially local room data; no claim of a real remote room |
| Code editor | P0 | Real typing, syntax highlighting, indentation, line numbers, selections, built-in find/replace | Monaco provides the editing component; Yjs binding comes later |
| Standard input | P0 | Editable multiline text; label explains that submitted input belongs to an execution | Local input captured later by execution submission |
| Result panel | P0 | Empty state, Output/Errors/Details tabs, readable preformatted text | Real results arrive from the API later |
| Workspace navigation | P0 | Back to Rooms; safe cleanup when leaving a workspace | Local preview navigation first |
| Room list/dashboard | P1; minimal shell today if time | Empty state, room cards, language/role/member count, Open, Create room | Server supplies authorized rooms later |
| Create room dialog | P1 | Room name, three language choices, validation, create-in-progress state | A frontend preview must be identified as local, not a real multi-user room |
| Sign-in screen | P1 | Clear sign-in entry, loading/failure state, preserved invitation destination | OAuth/session integration later; no fake logged-in account presented as real |
| Invitation flow | P1 | Owner-only invitation dialog; valid/expired/revoked/full/access-denied screens | The server issues and validates real invitation tokens |
| Participant strip | P1 | Name, avatar/color, count out of three, overflow-safe layout | Real identity/presence arrives later; example users must be marked as samples |
| Execution identity/details | P1 | Requester, ID, language, time, outcome, submitted source/input view | Source must match the stored job snapshot |
| Connection/save states | P1 | Loading, offline/reconnecting, unsynced, persistence error, confirmed saved | Only actual connection/persistence signals can drive real statuses |
| Shared error UI | P1 | Session expired, room unavailable, access denied, room full, API failure | Local examples can preview the layout before services exist |
| Keyboard/accessible controls | P0 basics, P1 completion | Labels, visible focus, keyboard activation, readable contrast | No backend needed |
| Responsive layout | P0 basic, P1 completion | Desktop first; stack panels on narrow screens without horizontal page overflow | Full mobile IDE support is not promised |

## 5. Workspace layout and button placement

```text
+--------------------------------------------------------------------------------+
| Project name | < Rooms | Room name             [A] [B] [C] | Invite | Account   |
+--------------------------------------------------------------------------------+
| main.py | Python | Local draft / actual status                 [Run]             |
+--------------------------------------------------+-----------------------------+
|                                                  | Standard input              |
|                                                  | [multiline input]           |
|                  MONACO EDITOR                   +-----------------------------+
|                                                  | Execution selector          |
|                                                  | [Output] [Errors] [Details] |
|                                                  | No executions yet           |
|                                                  |                             |
+--------------------------------------------------+-----------------------------+
| line:column | indentation | descriptive connection state                        |
+--------------------------------------------------------------------------------+
```

- Give the editor about 65–70% of desktop width; keep the remaining area for input/results.
- Put Run near the file/language toolbar so execution is easy to find. Keep Invite near participant identities because it changes room access.
- Use the header for room navigation and membership; avoid unrelated toolbar clutter.
- Use descriptive empty output rather than a fabricated successful result.
- On narrow screens, place input/results below the editor. Prioritize usable desktop/laptop editing over promising complete phone support; Monaco's project notes that mobile browsers are not supported.
- Use one restrained accent color, clear spacing, and a readable dark editor. A theme toggle is optional polish rather than a prerequisite to building the screen.
- Keep the current project name as a working label for now; choose the public name separately, since an existing platform uses CodeTogether.

## 6. Button and local-state behavior

| Action | Behavior in the first frontend milestone |
| --- | --- |
| Type/edit/paste/search | Real Monaco editing; preserve content when opening result tabs or resizing the page |
| Choose a creation language | Sets the starter template and filename for a new local preview; does not silently replace an existing room's source |
| Run | Disabled with an explanation until execution is connected. If we add a state-preview action, label it `Preview execution states`, not Run |
| Copy invitation | Available only for an actual issued invitation. A sample dialog can show a nonfunctional example without claiming it grants access |
| Copy source | Copies current code; show success only after the clipboard operation succeeds, otherwise show an actionable error |
| Clear output | If implemented, clear this user's local display selection; do not delete shared execution history or change a running job |
| Change tabs | Changes only the local result view; never changes shared code or another participant's selection |
| Leave room | Dispose editor/binding resources; if unsaved local work would be discarded, give a meaningful warning |
| Sign in | Real OAuth when integrated. Before then, offer an explicit local preview path or clearly indicate that sign-in is unavailable |
| Retry | Retry the relevant failed load/sync action; do not blindly resubmit an execution whose acceptance is uncertain |

Local draft recovery is useful if time permits. If added, namespace it per local preview/document and display `Saved on this device`, never server `Saved`. Saving source/input to a browser is different from persistent shared storage.

## 7. Required state design

### Document/connection states

- Initial editor loading: do not let a placeholder empty file overwrite the document later.
- Local preview: label it as local; show no fake live connection or authenticated participants.
- Connecting/synchronizing: distinguish it from fully connected editing.
- Unsynced/saving/saved: server confirmation is required for the relevant claim.
- Offline/reconnecting: retain local content and explain when actions such as Run are unavailable.
- Access denied/session expired: explain next action without displaying protected room content.
- Room full: say that three member accounts are already assigned; this is not just a client-side check.

### Execution states

- Empty, queued, compiling where supported, running, succeeded, compile error, runtime error, time limit, memory limit, output limit, and infrastructure error.
- Always tie visible output to its execution ID and submitted source/input.
- Preserve old output while an identifiable new execution is pending; do not make stale output look like the current job's result.
- Show compiler diagnostics separately from successful stdout. Program stderr is an output stream; do not infer final execution status solely from whether stderr is nonempty.
- Render source and output as text, not inserted HTML.
- Preview fixtures can demonstrate these states during frontend work, but must have a visible preview label and not masquerade as real execution.

## 8. UX enhancements, ordered by value

| Enhancement | Why it helps | Priority / estimated scope |
| --- | --- | --- |
| Keyboard access, clear labels, visible focus | Makes core controls understandable and usable | Required foundation; implement as controls are built |
| Monaco find/replace, indentation, bracket matching | Familiar coding interactions without rebuilding an editor | Use existing capabilities today; avoid custom feature work |
| Small success/error feedback | Confirms copy, creation, and load outcomes | P1; keep errors persistent when action is needed |
| Local draft recovery | Avoids losing unsent local code on refresh | P2, high value; 30–60 minutes including storage-failure handling |
| Copy/download current source | Makes progress easy to save outside the app | P2; 20–40 minutes including filename/clipboard handling |
| Ctrl/Cmd+Enter for Run | Fast execution workflow | P2; add when real Run exists; preserve Monaco keybinding behavior |
| Font size and word-wrap controls | Improves long-session readability | P2; 20–40 minutes; store preferences locally if useful |
| Resizable input/output/editor split | Lets users allocate screen space | P2; 45–90 minutes including keyboard/small-screen behavior |
| Theme toggle | Personal preference and comfort | P2; 30–60 minutes; one good default is enough initially |
| Focus mode | More space for code | P2; only after core navigation and panels are stable |
| Small execution snapshot viewer | Explains why an older result differs from current code | P1 minimal version; a full history UI is deferred |
| Recent room search | Helpful once a user has many rooms | Defer until the room list creates a real navigation problem |

These are planning estimates, not guarantees. Choose at most one optional enhancement today after the P0 checklist passes. Accessibility basics and honest state feedback are not optional decoration.

**Defer:** command palette, custom autocomplete engines, AI completions, video/chat, animations, multiple themes, elaborate settings, shared terminal, file explorer, repository integration, analytics dashboards, and session replay.

## 9. Frontend structure and backend readiness

Use the selected React + TypeScript + Vite + Monaco stack. Use plain CSS/CSS modules with a small spacing/color system. Avoid adding a global state library, component suite, or animation framework without a concrete need.

```text
apps/web/src/
  pages/                 # sign-in, room list, editor workspace
  components/editor/     # code editor, toolbar, input, result panels
  components/rooms/      # room cards and create/invite dialogs
  components/ui/         # buttons, tabs, dialogs, status displays
  services/              # room/auth/execution API boundary; fixtures kept separate
  types/                 # typed room, member, connection and execution models
  styles/                # design tokens, layout and component styling
```

- Reuse one room-language configuration for label, extension, and starter text.
- Separate fixture data from application services so replacing previews does not require rewriting the UI.
- Model a result as an object with identity/status/source snapshot, not a single global output string.
- Model shared content separately from local UI state. Once Yjs is connected, its document owns code content; do not keep a second authoritative React string overwriting it.
- Memoize/retain editor instances appropriately. Destroy resources on navigation, not on every keystroke.
- Monaco provides an editor, not the full VS Code product or automatic full language-server support for Python/C++/Java. Scope this milestone to language modes and the editor capabilities actually integrated.
- Frontend role checks improve UX; server checks remain necessary for security.

## 10. Today's 3.5-hour build sequence

The clock below begins when we start implementation. This planning conversation is not evidence that any build task is finished. If planning uses part of today's available hours, reduce the build target accordingly.

| Block | Time | Deliverable |
| --- | --- | --- |
| Confirm wireframe and first interactions | 15 min | Agree the editor-first layout and preview boundary |
| Scaffold application and navigation | 30 min | React/TypeScript/Vite app opens; editor/dashboard routes have real targets |
| Build workspace shell | 45 min | Header, toolbar, editor area, input/results layout |
| Integrate Monaco | 45 min | Real local editing and three language-mode configurations |
| Add input/tabs/basic state handling | 30 min | Local stdin, output/error/details tabs, useful empty/disabled states |
| Verify and repair | 30 min | Build/type checks, browser interaction, resizing, keyboard/focus, no source loss when switching tabs |
| Prepare GitHub checkpoint | 15 min | Accurate README, ignored local/generated files, screenshot, reviewable commit |

Total: **210 minutes / 3.5 hours**. If setup or Monaco integration takes longer, postpone dashboard details and optional enhancements. Do not sacrifice the final verification to add another feature.

**Three-hour stop point:** functional editor workspace and honest empty/disabled states; polish and secondary routes can remain incomplete. **Four-hour stretch:** a minimal create-room local preview flow or one small UX improvement, after verification.

### Follow-up frontend sessions

| Date | Focus |
| --- | --- |
| 22 Oct | Core local workspace and first reviewable frontend checkpoint |
| 23 Oct | Finish dashboard, create-room form, and sign-in/local-preview shell |
| 24 Oct | Invitation/access/error screens, participant rendering, execution-state fixtures |
| 25 Oct | Minimal source-snapshot details, local preferences/recovery if selected, navigation cleanup |
| 26 Oct | Cross-screen review, accessibility/responsiveness checks, fix defects, freeze optional UI work |

Real OAuth, WebSocket presence, shared persistence, and execution are integrated according to the main plan. Starting the frontend earlier does not establish that those backend milestones are finished.

## 11. GitHub progress checkpoints

The user intends to upload progress. Prepare reviewable source locally; repository creation/pushing will be handled when requested and the intended repository is known. No repository has been published by this planning task.

Suggested commits, only after the described changes exist:

1. `docs: define project and frontend milestones`
2. `chore: initialize frontend application`
3. `feat: add editor workspace and Monaco integration`
4. `feat: add room forms and execution panel states`
5. `docs: add setup instructions and frontend progress screenshot`

For the first frontend upload, include:

- [ ] Source files, package manifest and lockfile, configuration, and relevant plan documents.
- [ ] `.gitignore` excluding dependencies, generated build output, local environment files, and secrets.
- [ ] A README with purpose, prerequisites, exact local setup commands, screenshot, and limitations.
- [ ] Separate **Implemented locally**, **Preview/mock UI**, and **Planned backend integration** lists.
- [ ] State plainly that code execution and real collaboration are not operational if only the UI exists.
- [ ] Review the staged diff; do not claim tests/builds passed unless actually run.
- [ ] Update progress after each meaningful milestone instead of uploading one unexplained final folder.

Do not treat uploading this application's source to GitHub as implementing GitHub integration inside the product. These are separate activities. A frontend preview deployment also does not establish a running backend or isolated code execution service.

## 12. Frontend acceptance checklist

### Today's checkpoint

- [x] App starts from documented commands and the available build/type checks pass.
- [x] Real Monaco editor is usable; configurations for all three languages exist.
- [x] Input is editable, tabs work, and local source survives ordinary UI interactions.
- [x] Run is honestly unavailable before integration; sample states/users are explicitly labelled.
- [x] Main controls have labels/focus behavior and layout remains usable at laptop widths. Basic browser checks completed; a full accessibility audit remains future work.
- [x] No unrelated backend/AI/chat/file-explorer feature work has been introduced.
- [x] README accurately describes current functionality and screenshots reflect the actual app.

### Frontend-complete milestone by 26 October

- [ ] Required screens/dialogs and their primary navigation work in local preview.
- [ ] Room language, filenames, member count, role affordances, and full-room state are consistent.
- [ ] Loading/offline/error/result states can be inspected without confusing previews with reality.
- [ ] Selected execution details include source/input identity; late fixture results do not overwrite a different selection.
- [ ] Responsive layout and keyboard interactions have been checked.
- [ ] Integration boundaries are clear enough to connect auth, Yjs, persistence, and execution without a UI rewrite.

## References

- [Monaco editor scope and limitations](https://github.com/microsoft/monaco-editor)
- [WCAG accessibility quick reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [GitHub README guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)
