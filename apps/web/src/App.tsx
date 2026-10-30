import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import {
  ArrowDownToLine, ArrowRight, ArrowUpRight, Check, CheckCheck, ChevronDown,
  ChevronRight, CircleAlert, Code2, Copy, FileCode2, FlaskConical, Folder,
  FolderOpen, HardDrive, Info, LayoutDashboard, LoaderCircle, Maximize2, Minimize2,
  MoreHorizontal, Plus, Search, Settings2, ShieldCheck, Sparkles, Terminal, UserPlus,
  Users, WrapText, X,
} from 'lucide-react';
import { Dialog } from './components/Dialog';
import { AccountAvatar, AccountDialog } from './components/AccountDialog';
import { useAccount } from './auth';
import { WorkspaceEditor } from './components/WorkspaceEditor';
import {
  byteLength, formatUpdated, LANGUAGES, loadState, MAX_INPUT_BYTES, MAX_LOCAL_WORKSPACES,
  newWorkspace, STORAGE_KEY,
} from './model';
import type { Language, PreviewExecution, PreviewState, ResultTab, StoredState, View, Workspace } from './model';

type Modal = 'create' | 'invite' | 'settings' | 'about' | 'profile' | 'snapshot' | 'storage' | null;
type SaveStatus = 'saving' | 'saved' | 'error';
type Toast = { message: string; error?: boolean } | null;

const PREVIEW_LABELS: Record<Exclude<PreviewState, 'empty'>, string> = {
  queued: 'Queued', running: 'Running', success: 'Completed', 'compile-error': 'Compile error', 'time-limit': 'Time limit',
};

function LanguageBadge({ language, small = false }: { language: Language; small?: boolean }) {
  const item = LANGUAGES[language];
  return <span className={`language-icon ${small ? 'language-small' : ''}`} style={{ '--language-color': item.color } as CSSProperties}>{item.short}</span>;
}

function EmptyOutput({ onAbout }: { onAbout: () => void }) {
  return <div className="empty-output">
    <div className="terminal-illustration" aria-hidden="true"><div><i /><i /><i /></div><Terminal size={29} strokeWidth={1.4} /><span /></div>
    <h3>A place for your output.</h3>
    <p>Your results will appear here.<br />For now, make yourself at home in the editor.</p>
    <button className="text-button" onClick={onAbout}>What works in this preview <ArrowUpRight size={13} /></button>
  </div>;
}

function CreateWorkspace({ onCreate, onClose, count }: { onCreate: (name: string, language: Language) => void; onClose: () => void; count: number }) {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState<Language>('python');
  const [error, setError] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) { setError('Give your workspace a name.'); return; }
    if (count >= MAX_LOCAL_WORKSPACES) { setError(`This preview supports ${MAX_LOCAL_WORKSPACES} local workspaces.`); return; }
    onCreate(name.trim(), language);
  };
  return <Dialog title="A fresh start for your next idea." eyebrow="NEW WORKSPACE" onClose={onClose}>
    <p className="dialog-description">A focused space for one file. Saved in this browser, ready whenever you are.</p>
    <form onSubmit={submit}>
      <label className="field-label" htmlFor="workspace-name">Workspace name</label>
      <input id="workspace-name" data-autofocus value={name} maxLength={48} placeholder="e.g. Sorting things out" onChange={event => { setName(event.target.value); setError(''); }} aria-invalid={Boolean(error)} aria-describedby={error ? 'create-error' : undefined} />
      <label className="field-label language-field-label">Choose your language</label>
      <div className="language-options" role="group" aria-label="Workspace language">
        {(Object.keys(LANGUAGES) as Language[]).map(value => <button key={value} type="button" className={`language-option ${language === value ? 'selected' : ''}`} aria-pressed={language === value} onClick={() => setLanguage(value)}>
          <LanguageBadge language={value} /><span>{LANGUAGES[value].name}</span>{language === value && <Check size={15} />}
        </button>)}
      </div>
      <p className="field-hint">One language per workspace. Your existing code stays right where it is.</p>
      {error && <p className="form-error" id="create-error" role="alert"><CircleAlert size={14} />{error}</p>}
      <div className="dialog-note"><HardDrive size={15} /><span>Local preview · online rooms and invitations come next.</span></div>
      <div className="dialog-actions"><button className="button secondary" type="button" onClick={onClose}>Cancel</button><button className="button primary" type="submit">Create workspace <ArrowRight size={15} /></button></div>
    </form>
  </Dialog>;
}

export function App() {
  const account = useAccount();
  useEffect(() => { if (account.error || account.notice) setModal('profile'); }, [account.error, account.notice]);
  const [boot] = useState(loadState);
  const [state, setState] = useState<StoredState>(boot.state);
  const [view, setView] = useState<View>(location.hash === '#/workspaces' ? 'workspaces' : 'editor');
  const [modal, setModal] = useState<Modal>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(boot.warning ? 'error' : 'saving');
  const [storagePaused, setStoragePaused] = useState(Boolean(boot.warning));
  const [storageNotice, setStorageNotice] = useState(boot.warning ?? '');
  const [tab, setTab] = useState<ResultTab>('output');
  const [previews, setPreviews] = useState<Record<string, PreviewExecution>>({});
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [focusMode, setFocusMode] = useState(false);
  const [query, setQuery] = useState('');
  const latestState = useRef(state);
  latestState.current = state;
  const active = state.workspaces.find(workspace => workspace.id === state.activeId) ?? state.workspaces[0];
  const language = LANGUAGES[active.language];
  const preview = previews[active.id];

  const notify = useCallback((message: string, error = false) => setToast({ message, error }), []);
  const navigate = useCallback((next: View, id?: string) => {
    if (id) setState(previous => ({ ...previous, activeId: id }));
    setView(next);
    setCursor({ line: 1, column: 1 });
    location.hash = next === 'workspaces' ? '/workspaces' : `/workspace/${id ?? latestState.current.activeId}`;
  }, []);

  useEffect(() => {
    const syncHash = () => {
      if (location.hash === '#/workspaces') { setView('workspaces'); return; }
      const id = location.hash.startsWith('#/workspace/') ? location.hash.slice(12) : '';
      if (!id) { setView('editor'); return; }
      if (latestState.current.workspaces.some(workspace => workspace.id === id)) {
        setState(previous => ({ ...previous, activeId: id })); setView('editor');
      } else {
        setView('workspaces'); notify('That local workspace is not available in this browser.', true);
      }
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, [notify]);

  useEffect(() => {
    if (storagePaused) { setSaveStatus('error'); return; }
    setSaveStatus('saving');
    const save = () => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(latestState.current)); setSaveStatus('saved'); }
      catch { setSaveStatus('error'); }
    };
    const timer = window.setTimeout(save, 400);
    return () => window.clearTimeout(timer);
  }, [state, storagePaused]);

  useEffect(() => {
    const flush = () => {
      if (storagePaused) return false;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(latestState.current)); return true; }
      catch { setSaveStatus('error'); return false; }
    };
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!flush()) { event.preventDefault(); event.returnValue = ''; }
    };
    const onVisibility = () => { if (document.visibilityState === 'hidden') flush(); };
    window.addEventListener('beforeunload', beforeUnload);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [saveStatus, storagePaused]);

  useEffect(() => {
    const handleExternalChange = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || event.newValue === JSON.stringify(latestState.current)) return;
      setStorageNotice('Drafts changed in another tab. Saving here is paused to protect your current work. Download a copy before enabling saving.');
      setStoragePaused(true);
      setSaveStatus('error');
    };
    window.addEventListener('storage', handleExternalChange);
    return () => window.removeEventListener('storage', handleExternalChange);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), toast.error ? 6500 : 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => { document.title = view === 'editor' ? `${active.name} — CodeTogether` : 'Your workspaces — CodeTogether'; }, [view, active.name]);

  const updateWorkspace = (patch: Partial<Pick<Workspace, 'code' | 'stdin'>>) => {
    setState(previous => {
      const current = previous.workspaces.find(workspace => workspace.id === previous.activeId)!;
      if (Object.entries(patch).every(([key, value]) => current[key as 'code' | 'stdin'] === value)) return previous;
      return { ...previous, workspaces: previous.workspaces.map(workspace => workspace.id === current.id ? { ...workspace, ...patch, updatedAt: Date.now() } : workspace) };
    });
  };
  const copySource = async () => {
    try { await navigator.clipboard.writeText(active.code); notify('Source code copied to clipboard.'); }
    catch { notify('Clipboard access failed. Select the code in the editor and copy it manually.', true); }
  };
  const downloadSource = () => {
    const url = URL.createObjectURL(new Blob([active.code], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = language.file;
    document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify(`${language.file} download requested.`);
  };
  const choosePreview = (next: PreviewState) => {
    if (next === 'empty') { setPreviews(previous => { const copy = { ...previous }; delete copy[active.id]; return copy; }); return; }
    setPreviews(previous => ({ ...previous, [active.id]: { id: `preview-${Date.now()}`, workspaceId: active.id, state: next, source: active.code, stdin: active.stdin, language: active.language, createdAt: Date.now() } }));
    setTab(next === 'compile-error' ? 'errors' : 'output');
  };
  const create = (name: string, selectedLanguage: Language) => {
    const workspace = newWorkspace(name, selectedLanguage);
    setState(previous => ({ ...previous, activeId: workspace.id, workspaces: [...previous.workspaces, workspace] }));
    setModal(null); navigate('editor', workspace.id); notify('Local workspace created.');
  };
  const previewStatus = preview ? PREVIEW_LABELS[preview.state] : '';

  return <div className={`app ${focusMode ? 'focus-mode' : ''}`}>
    <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>Skip to workspace</a>
    <aside className="sidebar" aria-label="Main navigation">
      <button className="brand" onClick={() => navigate('workspaces')} aria-label="CodeTogether workspaces"><span className="brand-mark"><Code2 size={21} strokeWidth={2.2} /></span><span>Code<span className="brand-light">Together</span><span className="brand-dot">.</span></span></button>
      <div className="sidebar-section-label">YOUR SPACE</div>
      <button className={`nav-item ${view === 'editor' ? 'active' : ''}`} onClick={() => navigate('editor')}><Code2 size={17} /><span>Editor</span><span className="nav-active-dot" /></button>
      <button className={`nav-item ${view === 'workspaces' ? 'active' : ''}`} onClick={() => navigate('workspaces')}><LayoutDashboard size={16} /><span>Workspaces</span><span className="nav-count">{state.workspaces.length}</span></button>
      <div className="sidebar-project-heading"><span>RECENT WORKSPACES</span><button className="icon-button" onClick={() => setModal('create')} aria-label="Create workspace"><Plus size={15} /></button></div>
      <div className="workspace-links">
        {[...state.workspaces].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5).map(workspace => <button key={workspace.id} className={`workspace-link ${view === 'editor' && active.id === workspace.id ? 'current' : ''}`} onClick={() => navigate('editor', workspace.id)} title={workspace.name}><Folder size={14} /><span>{workspace.name}</span>{active.id === workspace.id && view === 'editor' && <span className="tiny-dot" />}</button>)}
      </div>
      <button className="new-workspace-sidebar" onClick={() => setModal('create')}><Plus size={15} />New workspace</button>
      <div className="sidebar-bottom">
        <div className="preview-card"><span className="preview-card-icon"><Sparkles size={16} /></span><h3>A little space to build.</h3><p>Write, explore, and keep your ideas moving.</p><button onClick={() => setModal('about')}>About this preview <ArrowUpRight size={13} /></button></div>
        <button className="nav-item quiet" onClick={() => setModal('settings')}><Settings2 size={16} /><span>Editor preferences</span></button>
        <button className="local-profile" onClick={() => setModal('profile')}><AccountAvatar user={account.account?.user} /><span><strong>{account.account?.user.name ?? "Your workspace"}</strong><small>{account.account ? "Browser drafts" : "Local preview"}</small></span><MoreHorizontal size={17} /></button>
      </div>
    </aside>

    <div className="main-shell">
      <header className="topbar">
        <div className="breadcrumbs"><span className="mobile-brand"><Code2 size={20} /></span><button onClick={() => navigate('workspaces')}>Workspace</button><ChevronRight size={13} /><span>{view === 'editor' ? active.name : 'All workspaces'}</span></div>
        <div className="topbar-actions"><button className="local-pill" onClick={() => setModal('about')}><span />Local preview<Info size={12} /></button><span className="header-separator" /><button className="account-header-button" onClick={() => setModal('profile')} aria-label={account.account ? "Open account" : "Sign in"}>{account.account ? <AccountAvatar user={account.account.user} /> : account.status === 'checking' ? 'Checking account…' : account.status === 'unavailable' ? 'Account unavailable' : 'Sign in'}</button></div>
      </header>

      <main id="main-content" tabIndex={-1} className={view === 'editor' ? 'workspace-main' : 'dashboard'}>
        {saveStatus === 'error' && <div className="storage-banner" role="alert"><CircleAlert size={15} /><span>{storageNotice && storagePaused ? storageNotice : 'Your changes could not be saved on this device. Download your code to keep a copy.'}</span><button onClick={downloadSource}>Download code</button><button onClick={() => setModal('storage')}>Storage options</button></div>}

        {view === 'editor' ? <>
          <section className="workspace-heading">
            <div><div className="eyebrow"><span />LET'S MAKE SOMETHING</div><h1>{active.name}</h1><p>One file. Plenty of possibilities.</p></div>
            <div className="collaboration-actions"><div className="participant-mini"><span className="avatar avatar-small" title="You — local editor">Y</span><span className="empty-seat" aria-label="Two future collaborator seats"><Users size={14} /></span></div><button className="button secondary invite-button" onClick={() => setModal('invite')}><UserPlus size={15} />Invite<span className="coming-dot" /></button></div>
          </section>

          <div className="workbench">
            <section className="source-panel" aria-label="Source code">
              <div className="source-tabs"><div className="file-tab"><LanguageBadge language={active.language} small /><span>{language.file}</span><span className="tab-dot" /></div><div className="source-tools"><button className={`icon-button ${state.settings.wordWrap ? 'selected-icon' : ''}`} aria-label="Toggle word wrap" aria-pressed={state.settings.wordWrap} title="Word wrap" onClick={() => setState(previous => ({ ...previous, settings: { ...previous.settings, wordWrap: !previous.settings.wordWrap } }))}><WrapText size={16} /></button><button className="icon-button" aria-label="Copy source code" title="Copy code" onClick={copySource}><Copy size={15} /></button><button className="icon-button" aria-label="Download source file" title="Download source" onClick={downloadSource}><ArrowDownToLine size={16} /></button><button className="icon-button focus-toggle" aria-label={focusMode ? 'Exit focus mode' : 'Enter focus mode'} title="Focus mode" onClick={() => setFocusMode(previous => !previous)}>{focusMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}</button></div></div>
              <div className="source-actionbar"><div className="language-label"><span style={{ backgroundColor: language.color }} />{language.version}<span className="one-file-label">Single file</span></div><div className="run-control" title="Server-side execution is not connected in this local preview"><button className="button run-button" disabled><span className="run-triangle" />Run code</button><span className="run-unavailable">Not connected</span></div></div>
              <div className="editor-container"><WorkspaceEditor key={active.id} workspace={active} settings={state.settings} onChange={code => updateWorkspace({ code })} onCursor={(line, column) => setCursor({ line, column })} onLimit={() => notify('Source limit: 64 KiB. The oversized edit was not applied.', true)} /></div>
              <div className="editor-footer"><span className={`save-status ${saveStatus === 'error' ? 'save-error' : ''}`} role="status">{saveStatus === 'saved' ? <CheckCheck size={13} /> : saveStatus === 'saving' ? <LoaderCircle size={12} className="spin" /> : <CircleAlert size={13} />}{saveStatus === 'saved' ? 'Saved on this device' : saveStatus === 'saving' ? 'Saving locally…' : 'Local save unavailable'}</span><span>{(byteLength(active.code) / 1024).toFixed(1)} / 64 KiB</span></div>
            </section>

            <aside className="execution-panel" aria-label="Program input and results">
              <section className="stdin-section"><div className="panel-heading"><h2><Terminal size={15} />Standard input</h2><span className="optional-label">OPTIONAL</span></div><div className="stdin-editor"><div className="stdin-line-numbers" aria-hidden="true">{active.stdin.split('\n').map((_, index) => <span key={index}>{index + 1}</span>)}</div><textarea aria-label="Standard input" value={active.stdin} spellCheck={false} placeholder="Input for your program…" onChange={event => { if (byteLength(event.target.value) > MAX_INPUT_BYTES) { notify('Standard input is limited to 16 KiB.', true); return; } updateWorkspace({ stdin: event.target.value }); }} /></div><div className="input-hint">Passed to your program when execution is connected.<span>{byteLength(active.stdin)} B</span></div></section>
              <section className="results-section"><div className="results-heading"><h2>Results</h2><div className="preview-select"><FlaskConical size={12} /><select aria-label="Preview execution state" value={preview?.state ?? 'empty'} onChange={event => choosePreview(event.target.value as PreviewState)}><option value="empty">Preview states</option><option value="queued">Queued preview</option><option value="running">Running preview</option><option value="success">Success preview</option><option value="compile-error">Error preview</option><option value="time-limit">Time-limit preview</option></select><ChevronDown size={11} /></div></div>
                <div className="result-tabs" role="tablist" aria-label="Execution result tabs">{(['output', 'errors', 'details'] as ResultTab[]).map(value => <button key={value} id={`tab-${value}`} role="tab" aria-selected={tab === value} aria-controls="result-content" tabIndex={tab === value ? 0 : -1} className={tab === value ? 'active' : ''} onClick={() => setTab(value)} onKeyDown={event => { if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return; event.preventDefault(); const values: ResultTab[] = ['output', 'errors', 'details']; const next = values[(values.indexOf(value) + (event.key === 'ArrowRight' ? 1 : 2)) % 3]; setTab(next); document.getElementById(`tab-${next}`)?.focus(); }}>{value === 'output' ? <Terminal size={13} /> : value === 'errors' ? <CircleAlert size={13} /> : <Info size={13} />}{value[0].toUpperCase() + value.slice(1)}{value === 'errors' && preview?.state === 'compile-error' && <span className="error-count">1</span>}</button>)}</div>
                <div id="result-content" role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={0} className="result-content">
                  {!preview ? <EmptyOutput onAbout={() => setModal('about')} /> : <div className="preview-result"><div className="preview-result-banner"><FlaskConical size={13} /><strong>UI preview</strong><span>Not executed</span></div><div className={`execution-status ${preview.state}`}><span />{previewStatus}<small>Sample state</small></div>
                    {tab === 'output' && <>{preview.state === 'success' ? <><div className="sample-code-output"><span>1</span><pre>This is sample output.</pre></div><p className="sample-disclaimer">This text demonstrates the output layout. Your code was not run.</p></> : preview.state === 'queued' || preview.state === 'running' ? <div className="sample-waiting"><LoaderCircle size={18} className="spin" /><p>{preview.state === 'queued' ? 'Example: waiting for an execution slot.' : 'Example: your program is running.'}</p><span>This preview does not start a job.</span></div> : <p className="result-message">{preview.state === 'time-limit' ? 'Example: the execution exceeded its configured deadline.' : 'This example has no standard output. Open Errors for sample diagnostics.'}</p>}</>}
                    {tab === 'errors' && <>{preview.state === 'compile-error' ? <><pre className="sample-error">{active.language === 'python' ? 'Example diagnostic:\nSyntaxError: invalid syntax' : active.language === 'cpp' ? 'Example compiler diagnostic:\nerror: expected ‘;’ before ‘return’' : 'Example compiler diagnostic:\nerror: \';\' expected'}</pre><p className="sample-disclaimer">Illustrative diagnostics only; the source was not compiled.</p></> : <div className="no-errors"><ShieldCheck size={23} /><p>{preview.state === 'time-limit' ? 'A time-limit outcome may have no error output.' : 'No sample diagnostics for this state.'}</p></div>}</>}
                    {tab === 'details' && <div className="execution-details"><dl><div><dt>Type</dt><dd>UI fixture · not a real job</dd></div><div><dt>Language</dt><dd>{LANGUAGES[preview.language].name}</dd></div><div><dt>Captured</dt><dd>{new Date(preview.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</dd></div><div><dt>Source</dt><dd>{byteLength(preview.source)} bytes</dd></div></dl><button className="button secondary snapshot-button" onClick={() => setModal('snapshot')}><FileCode2 size={14} />View captured source<ArrowUpRight size={13} /></button><p className="sample-disclaimer">This local snapshot stays fixed while you keep editing.</p></div>}
                  </div>}
                </div>
                <div className="execution-notice"><span className="notice-dot" /><p>Execution is coming next.<br /><span>Your code stays local in this preview.</span></p><button className="icon-button" aria-label="About code execution" onClick={() => setModal('about')}><ArrowUpRight size={15} /></button></div>
              </section>
            </aside>
          </div>
        </> : <section className="dashboard-content"><div className="dashboard-heading"><div><div className="eyebrow"><span />ROOM TO THINK</div><h1>Your workspaces<span className="brand-dot">.</span></h1><p>A new idea, a fresh file, a place to pick up where you left off.</p></div><button className="button primary" onClick={() => setModal('create')}><Plus size={16} />New workspace</button></div><div className="dashboard-toolbar"><h2>All workspaces <span>{state.workspaces.length}</span></h2><label className="search-field"><Search size={15} /><input aria-label="Search local workspaces" placeholder="Find a workspace…" value={query} onChange={event => setQuery(event.target.value)} /></label></div><div className="workspace-grid">{[...state.workspaces].sort((a, b) => b.updatedAt - a.updatedAt).filter(workspace => workspace.name.toLowerCase().includes(query.toLowerCase())).map(workspace => <button key={workspace.id} className="workspace-card" onClick={() => navigate('editor', workspace.id)}><div className="workspace-card-top"><LanguageBadge language={workspace.language} /><span className="local-card-label"><HardDrive size={11} />Local draft</span></div><h3>{workspace.name}</h3><p>{LANGUAGES[workspace.language].file}<span>·</span>{LANGUAGES[workspace.language].name}</p><div className="workspace-card-footer"><span>{formatUpdated(workspace.updatedAt)}</span><span className="card-open">Open<ArrowUpRight size={15} /></span></div></button>)}</div>{state.workspaces.filter(workspace => workspace.name.toLowerCase().includes(query.toLowerCase())).length === 0 && <div className="dashboard-empty"><FolderOpen size={33} /><h3>No matching workspaces</h3><p>Try another name or make space for a new idea.</p><button className="button secondary" onClick={() => setQuery('')}>Clear search</button></div>}<div className="dashboard-local-note"><HardDrive size={15} /><p>These drafts are shared within this browser profile and are not attached to an account. <button onClick={() => setModal('about')}>About this preview <ArrowUpRight size={12} /></button></p></div></section>}
      </main>

      <footer className="statusbar"><div><span className="statusbar-local"><span />Local only</span><span className="statusbar-divider" /><HardDrive size={12} /><span>Browser storage</span></div><div>{view === 'editor' && <><span>Ln {cursor.line}, Col {cursor.column}</span><span className="statusbar-divider" /><span>UTF-8</span><span className="statusbar-divider" /><span>{language.name}</span><span className="statusbar-divider" /><span className="find-hint">Ctrl / ⌘ F to find</span></>}<span className="version-label">v0.1</span></div></footer>
    </div>

    {modal === 'create' && <CreateWorkspace onCreate={create} onClose={() => setModal(null)} count={state.workspaces.length} />}
    {modal === 'invite' && <Dialog title="Good ideas are better together." eyebrow="COLLABORATION" onClose={() => setModal(null)}><p className="dialog-description">Rooms will bring up to three people into the same file. For now, this is your own local workspace.</p><div className="seat-list"><div><span className="avatar">Y</span><span><strong>You</strong><small>Local editor</small></span><span className="seat-role">This device</span></div>{[2, 3].map(seat => <div className="empty-seat-row" key={seat}><span className="seat-placeholder"><UserPlus size={16} /></span><span><strong>Collaborator {seat}</strong><small>Available when online rooms are connected</small></span></div>)}</div><div className="dialog-note"><Info size={15} /><span>There is no live room or invitation link yet. Example seats do not represent connected users.</span></div><div className="dialog-actions"><button className="button primary" onClick={() => setModal(null)}>Got it<Check size={15} /></button></div></Dialog>}
    {modal === 'settings' && <Dialog title="Make yourself comfortable." eyebrow="EDITOR PREFERENCES" onClose={() => setModal(null)}><p className="dialog-description">A few small adjustments for the way you like to work. Preferences are saved on this device.</p><div className="setting-row"><div><strong>Font size</strong><p>Find your comfortable reading size.</p></div><div className="stepper"><button aria-label="Decrease font size" disabled={state.settings.fontSize <= 12} onClick={() => setState(previous => ({ ...previous, settings: { ...previous.settings, fontSize: previous.settings.fontSize - 1 } }))}>−</button><span>{state.settings.fontSize}px</span><button aria-label="Increase font size" disabled={state.settings.fontSize >= 20} onClick={() => setState(previous => ({ ...previous, settings: { ...previous.settings, fontSize: previous.settings.fontSize + 1 } }))}>+</button></div></div><div className="setting-row"><div><strong>Word wrap</strong><p>Keep long lines inside the editor.</p></div><button className={`switch ${state.settings.wordWrap ? 'on' : ''}`} role="switch" aria-label="Word wrap" aria-checked={state.settings.wordWrap} onClick={() => setState(previous => ({ ...previous, settings: { ...previous.settings, wordWrap: !previous.settings.wordWrap } }))}><span /></button></div><div className="settings-shortcut"><Search size={15} /><span>Find in your file</span><kbd>Ctrl / ⌘ F</kbd></div><div className="dialog-actions"><button className="button primary" onClick={() => setModal(null)}>Done<Check size={15} /></button></div></Dialog>}
    {modal === 'about' && <Dialog title="Small beginnings. Real possibilities." eyebrow="FRONTEND MILESTONE 01" onClose={() => setModal(null)}><p className="dialog-description">This is a local frontend preview of CodeTogether, built for a focused coding experience.</p><div className="feature-list"><h3>Working right now</h3>{['Edit Python, C++, and Java locally', 'Recover browser-saved code and input', 'Create and switch between local workspaces', 'Copy, download, and inspect source snapshots'].map(item => <p key={item}><Check size={15} />{item}</p>)}</div><div className="feature-list upcoming"><h3>Next in the project</h3><p><Users size={15} />Authenticated rooms, shared editing, and cursors</p><p><Terminal size={15} />Isolated server execution and real results</p></div><div className="dialog-note"><FlaskConical size={15} /><span>“Preview states” uses labelled fixtures. It does not compile or execute your code.</span></div></Dialog>}
    {modal === 'profile' && <AccountDialog auth={account} onClose={() => setModal(null)} />}
    {modal === 'snapshot' && preview && <Dialog title="The source behind this preview." eyebrow="LOCAL SNAPSHOT · NOT EXECUTED" onClose={() => setModal(null)} wide><p className="dialog-description">Captured when you chose the sample state. Editing your workspace does not change this snapshot.</p><div className="snapshot-label"><FileCode2 size={14} />{LANGUAGES[preview.language].file}</div><pre className="snapshot-code">{preview.source}</pre><div className="snapshot-label"><Terminal size={14} />Captured standard input</div><pre className="snapshot-input">{preview.stdin || '(empty)'}</pre></Dialog>}
    {modal === 'storage' && <Dialog title="Keep a copy of your work." eyebrow="LOCAL STORAGE" onClose={() => setModal(null)}><p className="dialog-description">{storagePaused ? storageNotice : 'This browser could not save the latest draft. Storage may be full, blocked, or unavailable.'}</p><p className="dialog-description">Download your current source first. Enabling saving will replace this app’s previously stored draft with the workspaces currently open here.</p><div className="dialog-actions"><button className="button secondary" onClick={downloadSource}><ArrowDownToLine size={15} />Download source</button><button className="button primary" onClick={() => { setStorageNotice(''); setStoragePaused(false); setState(previous => ({ ...previous })); setModal(null); }}>Enable local saving</button></div></Dialog>}
    {toast && <div className={`toast ${toast.error ? 'toast-error' : ''}`} role={toast.error ? 'alert' : 'status'}>{toast.error ? <CircleAlert size={16} /> : <Check size={16} />}<span>{toast.message}</span><button className="icon-button" onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={14} /></button></div>}
  </div>;
}
